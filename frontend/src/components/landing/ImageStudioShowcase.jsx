function ImageStudioShowcase() {
  return (
    <>
      <style>{`
        .lyvo-studio-visual {
          position: relative;
          height: 360px;
          margin-top: 48px;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid var(--lyvo-border);
          background:
            radial-gradient(
              circle at 20% 20%,
              rgb(56 189 248 / 0.20),
              transparent 32%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgb(139 92 246 / 0.24),
              transparent 38%
            ),
            linear-gradient(
              135deg,
              var(--lyvo-surface-soft),
              var(--lyvo-surface)
            );
          box-shadow:
            inset 0 1px 0 rgb(255 255 255 / 0.04),
            0 25px 70px rgb(var(--lyvo-glow) / 0.08);
        }

        .lyvo-studio-grid {
          position: absolute;
          inset: 0;
          opacity: 0.16;
          background-image:
            linear-gradient(
              rgb(148 163 184 / 0.18) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgb(148 163 184 / 0.18) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 25%,
            black 75%,
            transparent
          );
        }

        .lyvo-studio-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 270px;
          height: 270px;
          transform: translate(-50%, -50%);
          border: 1px solid rgb(129 140 248 / 0.22);
          border-radius: 50%;
          animation: lyvoOrbit 12s linear infinite;
        }

        .lyvo-studio-orbit::before,
        .lyvo-studio-orbit::after {
          content: "";
          position: absolute;
          inset: 32px;
          border: 1px solid rgb(56 189 248 / 0.18);
          border-radius: 50%;
        }

        .lyvo-studio-orbit::after {
          inset: 65px;
          border-color: rgb(168 85 247 / 0.18);
        }

        .lyvo-studio-art {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 190px;
          height: 190px;
          transform: translate(-50%, -50%);
          border-radius: 38% 62% 55% 45%;
          background:
            radial-gradient(
              circle at 30% 25%,
              #ffffff 0 3%,
              transparent 4%
            ),
            radial-gradient(
              circle at 70% 32%,
              #38bdf8 0 8%,
              transparent 9%
            ),
            radial-gradient(
              circle at 35% 70%,
              #a78bfa 0 13%,
              transparent 14%
            ),
            radial-gradient(
              circle at 75% 72%,
              #f472b6 0 9%,
              transparent 10%
            ),
            linear-gradient(
              135deg,
              #0ea5e9,
              #6366f1 45%,
              #8b5cf6 70%,
              #ec4899
            );
          box-shadow:
            0 0 45px rgb(99 102 241 / 0.35),
            0 0 100px rgb(56 189 248 / 0.18);
          animation: lyvoArtworkFloat 5s ease-in-out infinite;
        }

        .lyvo-studio-art::before {
          content: "";
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgb(255 255 255 / 0.55),
              transparent 22%
            ),
            radial-gradient(
              circle at 30% 70%,
              rgb(14 165 233 / 0.75),
              transparent 30%
            ),
            radial-gradient(
              circle at 75% 65%,
              rgb(236 72 153 / 0.70),
              transparent 30%
            );
          filter: blur(8px);
        }

        .lyvo-studio-art::after {
          content: "✦";
          position: absolute;
          top: 26px;
          right: 32px;
          color: white;
          font-size: 20px;
          text-shadow: 0 0 18px white;
          animation: lyvoSparkle 2.5s ease-in-out infinite;
        }

        .lyvo-studio-prompt {
          position: absolute;
          left: 26px;
          bottom: 24px;
          width: min(330px, calc(100% - 52px));
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid rgb(148 163 184 / 0.16);
          border-radius: 15px;
          background: rgb(7 10 19 / 0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          text-align: left;
          box-shadow: 0 12px 35px rgb(0 0 0 / 0.22);
        }

        [data-theme="light"] .lyvo-studio-prompt {
          background: rgb(255 255 255 / 0.78);
        }

        .lyvo-studio-prompt-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            var(--lyvo-primary),
            var(--lyvo-accent)
          );
          color: white;
          font-size: 15px;
        }

        .lyvo-studio-prompt-text {
          min-width: 0;
        }

        .lyvo-studio-prompt-label {
          margin-bottom: 3px;
          color: var(--lyvo-text-soft);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .lyvo-studio-prompt-value {
          overflow: hidden;
          color: var(--lyvo-text);
          font-size: 12px;
          line-height: 1.4;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .lyvo-studio-status {
          position: absolute;
          right: 25px;
          top: 24px;
          padding: 9px 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgb(34 197 94 / 0.20);
          border-radius: 999px;
          background: rgb(7 10 19 / 0.60);
          backdrop-filter: blur(14px);
          color: #86efac;
          font-size: 11px;
          font-weight: 600;
        }

        [data-theme="light"] .lyvo-studio-status {
          background: rgb(255 255 255 / 0.70);
        }

        .lyvo-studio-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 12px rgb(74 222 128 / 0.8);
          animation: lyvoStatusPulse 1.8s ease-in-out infinite;
        }

        .lyvo-studio-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #93c5fd;
          box-shadow: 0 0 14px rgb(147 197 253 / 0.9);
          animation: lyvoParticleFloat 4s ease-in-out infinite;
        }

        .lyvo-studio-particle.one {
          left: 18%;
          top: 32%;
        }

        .lyvo-studio-particle.two {
          right: 20%;
          top: 27%;
          animation-delay: 1s;
        }

        .lyvo-studio-particle.three {
          right: 27%;
          bottom: 30%;
          animation-delay: 2s;
        }

        @keyframes lyvoOrbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes lyvoArtworkFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0) rotate(-3deg);
          }

          50% {
            transform: translate(-50%, -50%) translateY(-12px) rotate(3deg);
          }
        }

        @keyframes lyvoSparkle {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.85) rotate(0deg);
          }

          50% {
            opacity: 1;
            transform: scale(1.2) rotate(18deg);
          }
        }

        @keyframes lyvoStatusPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes lyvoParticleFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }

          50% {
            transform: translateY(-18px);
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .lyvo-studio-visual {
            height: 300px;
            margin-top: 30px;
          }

          .lyvo-studio-orbit {
            width: 210px;
            height: 210px;
          }

          .lyvo-studio-art {
            width: 145px;
            height: 145px;
          }

          .lyvo-studio-status {
            right: 15px;
            top: 15px;
          }

          .lyvo-studio-prompt {
            left: 15px;
            bottom: 15px;
            width: calc(100% - 30px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lyvo-studio-orbit,
          .lyvo-studio-art,
          .lyvo-studio-art::after,
          .lyvo-studio-status-dot,
          .lyvo-studio-particle {
            animation: none !important;
          }
        }
      `}</style>

      <section
        id="studio"
        style={{
          padding: "120px 0",
        }}
      >
        <div className="lyvo-container">
          <div
            className="lyvo-glass"
            style={{
              borderRadius: "28px",
              padding: "50px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "18px",
              }}
            >
              🎨
            </div>

            <div
              style={{
                color: "var(--lyvo-primary-hover)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Image Studio
            </div>

            <h2
              className="lyvo-heading"
              style={{
                fontSize: "clamp(38px, 5vw, 62px)",
                margin: "15px 0",
              }}
            >
              From words to
              <br />
              <span className="lyvo-gradient-text">
                visuals.
              </span>
            </h2>

            <p
              className="lyvo-subheading"
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "17px",
              }}
            >
              Describe an idea and turn it into
              an image without leaving your workspace.
            </p>

            {/* =====================================
                AI IMAGE VISUAL
               ===================================== */}

            <div className="lyvo-studio-visual">
              <div className="lyvo-studio-grid" />

              <div className="lyvo-studio-orbit" />

              <div className="lyvo-studio-art" />

              <div className="lyvo-studio-particle one" />
              <div className="lyvo-studio-particle two" />
              <div className="lyvo-studio-particle three" />

              {/* Generation status */}

              <div className="lyvo-studio-status">
                <span className="lyvo-studio-status-dot" />
                AI visual generated
              </div>

              {/* Prompt */}

              <div className="lyvo-studio-prompt">
                <div className="lyvo-studio-prompt-icon">
                  ✦
                </div>

                <div className="lyvo-studio-prompt-text">
                  <div className="lyvo-studio-prompt-label">
                    Prompt
                  </div>

                  <div className="lyvo-studio-prompt-value">
                    A futuristic dreamscape created by LYVO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ImageStudioShowcase;