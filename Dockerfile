FROM ghost:5-alpine
COPY theme/source-custom /var/lib/ghost/current/content/themes/source-custom
COPY docker-entrypoint-custom.sh /usr/local/bin/docker-entrypoint-custom.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-custom.sh
ENTRYPOINT ["docker-entrypoint-custom.sh"]
CMD ["node", "current/index.js"]
