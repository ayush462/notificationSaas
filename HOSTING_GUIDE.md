# Free Hosting Guide (No AWS)

## Recommended stack
- API + Worker: [Render](https://render.com) free tier web service/background worker
- Dashboard: [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com)
- PostgreSQL: [Neon](https://neon.tech) free tier
- Redis: [Upstash](https://upstash.com) free tier
- Kafka: [Confluent Cloud](https://www.confluent.io) free tier

## Notes
- Set environment variables in each platform dashboard.
- Keep API and worker in separate services for independent scaling.
- Add webhook alerts and uptime checks for production.
