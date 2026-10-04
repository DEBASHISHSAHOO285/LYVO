const axios = require("axios");
const fs = require("fs");

const {
  extractDocumentText,
} = require("./document.service");

// ======================================
// LYVO AI SERVICE
// ======================================

// Models are tried in this order when the selected/free model is unavailable.
const FALLBACK_MODELS = [
  "qwen/qwen3.8-27b:free",
  "meta-llama/llama-3.3-8b-instruct:free",
  "google/gemma-3-12b-it:free",
];

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const MAX_HISTORY_MESSAGES = 30;
const MAX_DOCUMENT_TOTAL_CHARS = 120000;

// ======================================
// GENERATE AI RESPONSE
// ======================================

async function generateAIResponse({
  messages,
  mode = "quick",
  model = null,
  attachments = [],
}) {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array.");
  }

  if (!messages.length) {
    throw new Error("At least one message is required.");
  }

  const allowedModes = [
    "quick",
    "deep-think",
    "build",
    "teach",
    "debate",
    "decision",
    "creative",
    "image",
  ];

  if (!allowedModes.includes(mode)) {
    throw new Error("Invalid AI mode.");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  // ======================================
  // SELECT MODEL
  // ======================================

  const requestedModel = model || "openrouter/free";

  const modelsToTry = buildModelList(requestedModel);

  // ======================================
  // SYSTEM PROMPT
  // ======================================

  const systemPrompt = getSystemPrompt(mode);

  // ======================================
  // CURRENT DATE & TIME
  // ======================================

  const now = new Date();

  const currentDateTime = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "long",
  });

  const timeContext = `
CURRENT DATE AND TIME

The current date and time in India (IST) is:

${currentDateTime}

Use this date and time when the user asks about:
- today's date
- current time
- today
- tomorrow
- yesterday
- relative dates
- time-sensitive calculations

Do not assume that your training-data cutoff represents the current date.
`;

  // ======================================
  // WEB SEARCH INSTRUCTIONS
  // ======================================

  const webSearchInstructions = `
WEB SEARCH

No live web search tool is currently available.

Do not pretend to search the web.

For general knowledge, answer directly using your available knowledge.

If the user asks for information that requires live web access, clearly tell the user that live web search is not currently available instead of pretending to search.
`;

  // ======================================
  // FILE INSTRUCTIONS
  // ======================================

  const fileInstructions = `
FILE UNDERSTANDING

When files are attached to the user's message:

- Use the provided file content as the primary source for questions about that file.
- For images, inspect the image directly.
- For documents, use the extracted document text.
- Do not claim that a file is unavailable when file content has been provided.
- Do not invent information that is not present in the file.
- If the extracted content is incomplete or unreadable, clearly say so.
- When summarizing a file, focus on the actual content of that file.
`;

  // ======================================
  // FINAL SYSTEM PROMPT
  // ======================================

  const finalSystemPrompt = `
${systemPrompt}

${timeContext}

${webSearchInstructions}

${fileInstructions}
`;

  // ======================================
  // BUILD AI MESSAGES
  // ======================================

  const cleanedMessages = cleanConversationHistory(messages);

  const aiMessages = [
    {
      role: "system",
      content: finalSystemPrompt,
    },
    ...cleanedMessages,
  ];

  // ======================================
  // PROCESS ATTACHMENTS
  // ======================================

  if (Array.isArray(attachments) && attachments.length > 0) {
    const imageAttachments = attachments.filter(
      (attachment) =>
        attachment &&
        typeof attachment.mimeType === "string" &&
        attachment.mimeType.startsWith("image/")
    );

    const documentAttachments = attachments.filter(
      (attachment) =>
        attachment &&
        typeof attachment.mimeType === "string" &&
        !attachment.mimeType.startsWith("image/")
    );

    // ======================================
    // FIND LAST USER MESSAGE
    // ======================================

    const lastUserMessageIndex =
      findLastUserMessageIndex(aiMessages);

    if (lastUserMessageIndex !== -1) {
      const lastUserMessage =
        aiMessages[lastUserMessageIndex];

      const originalText =
        typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : "";

      // ======================================
      // DOCUMENT CONTENT
      // ======================================

      const documentSections = [];

      let totalDocumentChars = 0;

      for (const attachment of documentAttachments) {
        try {
          if (
            totalDocumentChars >=
            MAX_DOCUMENT_TOTAL_CHARS
          ) {
            documentSections.push(`
FILE: ${attachment.originalName}

FILE STATUS:

Additional document content was skipped because the combined document content limit was reached.
`);

            continue;
          }

          const result = await extractDocumentText(
            attachment
          );

          if (result.success) {
            const remainingChars =
              MAX_DOCUMENT_TOTAL_CHARS -
              totalDocumentChars;

            const extractedText =
              String(result.text || "").slice(
                0,
                remainingChars
              );

            totalDocumentChars += extractedText.length;

            documentSections.push(`
FILE: ${attachment.originalName}

FILE TYPE: ${attachment.fileType}

EXTRACTED CONTENT:

${extractedText}
`);
          } else {
            documentSections.push(`
FILE: ${attachment.originalName}

FILE TYPE: ${attachment.fileType}

FILE STATUS:

${result.message}
`);
          }
        } catch (error) {
          console.error(
            `Document extraction failed for "${attachment.originalName}":`,
            error.message
          );

          documentSections.push(`
FILE: ${attachment.originalName}

FILE STATUS:

Unable to extract readable text from this file.
`);
        }
      }

      // ======================================
      // MULTIMODAL CONTENT
      // ======================================

      const multimodalContent = [];

      let enhancedText = originalText;

      if (documentSections.length > 0) {
        enhancedText += `

ATTACHED DOCUMENT CONTENT

${documentSections.join("\n\n")}

Use this attached content to answer the user's request.
`;
      }

      multimodalContent.push({
        type: "text",
        text: enhancedText,
      });

      // ======================================
      // IMAGE CONTENT
      // ======================================

      for (const attachment of imageAttachments) {
        try {
          const imageDataUrl =
            createImageDataUrl(attachment);

          multimodalContent.push({
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          });
        } catch (error) {
          console.error(
            `Failed to process image "${attachment.originalName}":`,
            error.message
          );

          // Don't crash the entire request because of one image.
          multimodalContent.push({
            type: "text",
            text: `\n[Unable to load attached image: ${attachment.originalName}]\n`,
          });
        }
      }

      // ======================================
      // REPLACE LAST USER MESSAGE
      // ======================================

      if (
        multimodalContent.length > 1 ||
        documentSections.length > 0
      ) {
        aiMessages[lastUserMessageIndex] = {
          ...lastUserMessage,
          content: multimodalContent,
        };
      }
    }
  }

  // ======================================
  // OPENROUTER REQUEST
  // ======================================

  let lastError = null;

  for (let index = 0; index < modelsToTry.length; index++) {
    const currentModel = modelsToTry[index];

    try {
      console.log(
        `LYVO AI request → ${currentModel}`
      );

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: currentModel,
          messages: aiMessages,
          temperature: getTemperature(mode),
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "LYVO - Your AI Workspace",
          },
          timeout: 60000,
          maxContentLength: 20 * 1024 * 1024,
          maxBodyLength: 20 * 1024 * 1024,
        }
      );

      // ======================================
      // EXTRACT AI RESPONSE
      // ======================================

      const choice =
        response.data?.choices?.[0];

      if (!choice) {
        throw new Error(
          "AI provider returned an empty response."
        );
      }

      console.log(
        `LYVO AI response ← ${currentModel}`
      );

      // ======================================
      // FINAL RESPONSE
      // ======================================

      return {
        content:
          choice.message?.content || "",

        model:
          response.data?.model ||
          currentModel,

        mode,

        usage:
          response.data?.usage || null,
      };
    } catch (error) {
      lastError = error;

      const status =
        error.response?.status;

      const providerMessage =
        extractProviderErrorMessage(error);

      // ======================================
      // RATE LIMIT
      // ======================================

      if (status === 429) {
        console.warn(
          `OpenRouter rate limit for model "${currentModel}".`
        );

        if (providerMessage) {
          console.warn(
            `OpenRouter message: ${providerMessage}`
          );
        }

        // Try another model if available.
        if (index < modelsToTry.length - 1) {
          console.log(
            `Trying fallback model: ${modelsToTry[index + 1]}`
          );

          continue;
        }

        throw new Error(
          "LYVO AI is temporarily rate-limited by the AI provider. Please wait a little and try again."
        );
      }

      // ======================================
      // AUTH ERROR
      // ======================================

      if (status === 401) {
        console.error(
          "OpenRouter authentication failed."
        );

        throw new Error(
          "LYVO AI authentication failed. Please check the OpenRouter API key."
        );
      }

      // ======================================
      // PAYMENT / CREDIT ERROR
      // ======================================

      if (status === 402) {
        console.error(
          "OpenRouter account/payment limit reached."
        );

        throw new Error(
          "The AI provider account has reached its available credit or payment limit."
        );
      }

      // ======================================
      // BAD REQUEST
      // ======================================

      if (status === 400) {
        console.error(
          "OpenRouter rejected the request:",
          providerMessage || error.message
        );

        throw new Error(
          providerMessage ||
            "The AI provider rejected the request. The selected model may not support this type of file or request."
        );
      }

      // ======================================
      // MODEL NOT AVAILABLE
      // ======================================

      if (
        status === 404 ||
        status === 503
      ) {
        console.warn(
          `Model "${currentModel}" is unavailable.`
        );

        if (index < modelsToTry.length - 1) {
          continue;
        }

        throw new Error(
          "The selected AI model is currently unavailable. Please try again."
        );
      }

      // ======================================
      // SERVER ERROR
      // ======================================

      if (
        status >= 500 &&
        status <= 599
      ) {
        console.warn(
          `AI provider server error for "${currentModel}".`
        );

        if (index < modelsToTry.length - 1) {
          continue;
        }

        throw new Error(
          "The AI provider is temporarily unavailable. Please try again shortly."
        );
      }

      // ======================================
      // UNKNOWN ERROR
      // ======================================

      console.error(
        "OpenRouter request failed:",
        error.message
      );

      if (providerMessage) {
        console.error(
          "Provider message:",
          providerMessage
        );
      }

      throw new Error(
        providerMessage ||
          "Unable to get a response from the AI provider."
      );
    }
  }

  throw new Error(
    lastError?.message ||
      "Unable to get a response from the AI provider."
  );
}

// ======================================
// BUILD MODEL LIST
// ======================================

function buildModelList(requestedModel) {
  const models = [];

  if (
    requestedModel &&
    requestedModel !== "openrouter/free"
  ) {
    models.push(requestedModel);
  }

  for (const fallback of FALLBACK_MODELS) {
    if (!models.includes(fallback)) {
      models.push(fallback);
    }
  }

  return models;
}

// ======================================
// CLEAN CONVERSATION HISTORY
// ======================================

function cleanConversationHistory(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  const recentMessages =
    messages.slice(-MAX_HISTORY_MESSAGES);

  return recentMessages.map((message) => {
    if (!message || typeof message !== "object") {
      return message;
    }

    const cleanedMessage = {
      role: message.role,
      content: cleanMessageContent(
        message.content
      ),
    };

    // Preserve name if present.
    if (message.name) {
      cleanedMessage.name = message.name;
    }

    return cleanedMessage;
  });
}

// ======================================
// CLEAN MESSAGE CONTENT
// ======================================

function cleanMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return content;
  }

  const cleanedParts = [];

  for (const part of content) {
    if (!part || typeof part !== "object") {
      continue;
    }

    // --------------------------------------
    // TEXT
    // --------------------------------------

    if (
      part.type === "text" &&
      typeof part.text === "string"
    ) {
      cleanedParts.push({
        type: "text",
        text: part.text,
      });

      continue;
    }

    // --------------------------------------
    // IMAGE
    // --------------------------------------

    if (
      part.type === "image_url" ||
      part.type === "image"
    ) {
      // Do NOT resend old base64 images from DB.
      //
      // The current request attachment will be
      // added later by the attachment processor.
      continue;
    }

    // --------------------------------------
    // OTHER SAFE CONTENT
    // --------------------------------------

    if (part.type) {
      cleanedParts.push(part);
    }
  }

  if (cleanedParts.length === 0) {
    return "";
  }

  // If there is only one text block, return text.
  if (
    cleanedParts.length === 1 &&
    cleanedParts[0].type === "text"
  ) {
    return cleanedParts[0].text;
  }

  return cleanedParts;
}

// ======================================
// EXTRACT PROVIDER ERROR
// ======================================

function extractProviderErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return null;
  }

  if (
    typeof data.error === "string"
  ) {
    return data.error;
  }

  if (
    data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  if (
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return null;
}

// ======================================
// FIND LAST USER MESSAGE
// ======================================

function findLastUserMessageIndex(messages) {
  for (
    let index = messages.length - 1;
    index >= 0;
    index--
  ) {
    if (
      messages[index] &&
      messages[index].role === "user"
    ) {
      return index;
    }
  }

  return -1;
}

// ======================================
// CREATE IMAGE DATA URL
// ======================================

function createImageDataUrl(attachment) {
  if (!attachment.filePath) {
    throw new Error(
      "Image file path is missing."
    );
  }

  if (
    !fs.existsSync(
      attachment.filePath
    )
  ) {
    throw new Error(
      `Image file not found: ${attachment.filePath}`
    );
  }

  const imageBuffer =
    fs.readFileSync(
      attachment.filePath
    );

  if (!imageBuffer.length) {
    throw new Error(
      `Image file is empty: ${attachment.originalName}`
    );
  }

  const base64 =
    imageBuffer.toString("base64");

  return `data:${attachment.mimeType};base64,${base64}`;
}

// ======================================
// MODE SYSTEM PROMPTS
// ======================================

function getSystemPrompt(mode) {
  const prompts = {
    // ======================================
    // QUICK
    // ======================================

    quick: `
You are LYVO, a helpful and intelligent AI workspace assistant.

Give clear, accurate and useful answers.

Keep responses reasonably concise unless the user asks for detail.

Use markdown when it improves readability.

When current information is required, use web search instead of guessing.
`,

    // ======================================
    // DEEP THINK
    // ======================================

    "deep-think": `
You are LYVO Deep Think mode.

Analyze problems carefully before answering.

Consider:

- assumptions
- alternatives
- trade-offs
- risks
- edge cases

Give a structured and well-reasoned answer.

Do not reveal private chain-of-thought or hidden reasoning.

Provide concise conclusions and useful explanations instead.

When current information is required, use web search instead of guessing.
`,

    // ======================================
    // BUILD
    // ======================================

    build: `
You are LYVO Build Mode.

Help the user build:

- software
- websites
- APIs
- applications
- products
- automation systems
- technical projects

Prefer practical implementation.

Provide:

- architecture
- code
- debugging steps
- implementation guidance
- practical recommendations

Focus on producing something the user can actually build.

When current technical documentation or information is required, use web search.
`,

    // ======================================
    // TEACH
    // ======================================

    teach: `
You are LYVO Teach Mode.

Act like a patient expert teacher.

Explain concepts from simple to advanced.

Use:

- examples
- analogies
- step-by-step explanations
- practical examples

Adapt explanations to the user's apparent level.

When the user asks about current documentation or recent changes, use web search.
`,

    // ======================================
    // DEBATE
    // ======================================

    debate: `
You are LYVO Debate Mode.

Analyze the topic from multiple perspectives.

Identify:

- arguments
- counterarguments
- assumptions
- weaknesses
- evidence
- trade-offs

Be balanced and intellectually honest.

Do not manufacture evidence.

When the debate depends on recent events or current facts, use web search.
`,

    // ======================================
    // DECISION
    // ======================================

    decision: `
You are LYVO Decision Mode.

Help the user make better decisions.

Identify:

- goal
- constraints
- options
- trade-offs
- risks
- likely outcomes

End with a practical recommendation when enough information is available.

When the decision depends on current prices, products, companies, regulations, availability, or recent information, use web search.
`,

    // ======================================
    // CREATIVE
    // ======================================

    creative: `
You are LYVO Creative Mode.

Help generate original:

- ideas
- concepts
- writing
- campaigns
- stories
- designs
- creative directions

Be imaginative while remaining useful and aligned with the user's request.

When the user asks for current trends or recent references, use web search.
`,

    // ======================================
    // IMAGE
    // ======================================

    image: `
You are LYVO Image Studio assistant.

Help the user create strong image-generation prompts and visual concepts.

Describe:

- subject
- composition
- lighting
- style
- atmosphere
- camera perspective
- important visual details

When current visual trends or recent references are requested, use web search.
`,
  };

  return (
    prompts[mode] ||
    prompts.quick
  );
}

// ======================================
// MODE TEMPERATURE
// ======================================

function getTemperature(mode) {
  const temperatures = {
    quick: 0.5,
    "deep-think": 0.3,
    build: 0.2,
    teach: 0.4,
    debate: 0.4,
    decision: 0.3,
    creative: 0.8,
    image: 0.8,
  };

  return (
    temperatures[mode] ?? 0.5
  );
}

// ======================================
// EXPORT
// ======================================

module.exports = {
  generateAIResponse,
  getSystemPrompt,
  getTemperature,
};