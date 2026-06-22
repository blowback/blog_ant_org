# ---- Stage 1: compile the theme from source ----
# Build assets/built (screen.css + source.js) with gulp so the served theme is
# always generated from the source CSS/JS — never a stale checked-in artifact.
FROM node:22-alpine AS theme-builder
WORKDIR /theme
COPY theme/source-custom/ ./
# --legacy-peer-deps: the theme's dev tooling has peer-dependency conflicts that
# npm refuses to resolve strictly; this matches the working local install.
RUN npm install --legacy-peer-deps --no-audit --no-fund \
    && npx gulp build \
    && rm -rf node_modules

# ---- Stage 2: Ghost image with the compiled theme ----
FROM ghost:5-alpine
COPY --from=theme-builder /theme /var/lib/ghost/current/content/themes/source-custom
# Stage routes.yaml outside the content volume; the custom entrypoint copies it
# into content/settings on every boot so the repo stays the source of truth.
COPY routes.yaml /var/lib/ghost/current/content/settings/routes.yaml
COPY docker-entrypoint-custom.sh /usr/local/bin/docker-entrypoint-custom.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-custom.sh
ENTRYPOINT ["docker-entrypoint-custom.sh"]
CMD ["node", "current/index.js"]
