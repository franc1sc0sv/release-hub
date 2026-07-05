FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @release-hub/shared build \
  && pnpm --filter @release-hub/db build \
  && pnpm --filter @release-hub/api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/turbo.json /app/
COPY --from=build /app/packages /app/packages
COPY --from=build /app/apps/api /app/apps/api
RUN chown -R node:node /app/apps/api
USER node
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main"]
