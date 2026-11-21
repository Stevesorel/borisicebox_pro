# Boris IceBox

E-commerce platform I built for a client, Boris IceBox. It has a customer storefront, a separate admin interface and a back end API, all packaged with Docker Compose.

Live site: https://borisicebox.com

## Architecture

```
            Customer browser                 Admin browser
                   |                                |
        frontend-shop (Nuxt)              frontend-admin (Vite)
          127.0.0.1:8082                     127.0.0.1:8083
                   \                              /
                    \----------- backend ---------/
                              127.0.0.1:5000
                                    |
                            PostgreSQL 16 (boris_icebox)
```

| Service | Role | Technology | Local port |
| --- | --- | --- | --- |
| `frontend-shop` | Customer storefront | Nuxt | 8082 |
| `frontend-admin` | Admin interface | Vite app served as static files | 8083 |
| `backend` | API, file uploads | [Node.js / Express: confirm and edit] | 5000 |
| `postgres` | Database | PostgreSQL 16 (Alpine) | not published |

All services share one Docker bridge network and restart automatically. The database starts first and the back end waits for its healthcheck before starting. Product uploads and database data live in named Docker volumes.

## Features

- [Customer side: for example browsing products, cart, checkout. Write only what really exists.]
- [Payment: for example the payment provider you integrated, or remove this line.]
- [Admin side: for example product and order management.]
- [Real-time updates: the storefront is configured with a socket endpoint. Describe what it is used for, or remove this line.]

## Run it locally

Requirements: Docker 20.10 or later and Docker Compose v2.

```bash
git clone https://github.com/Stevesorel/borisicebox_pro.git
cd borisicebox_pro

# create your environment file (see the next section), then:
docker compose up -d --build
```

Then open:

- Storefront: http://localhost:8082
- Admin: http://localhost:8083
- API: http://localhost:5000

Stop everything with `docker compose down`. Add `-v` to also delete the database and uploads.

## Configuration

Settings come from a `.env` file that is not committed. The services read these variables:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | postgres | Database name and credentials |
| `PORT` | backend | Port the API listens on |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | backend | Connection to PostgreSQL |
| `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_SOCKET_BASE`, `NUXT_API_BASE_INTERNAL` | frontend-shop | API and socket addresses, set at build time |
| `VITE_API_URL` | frontend-admin | API address, set at build time |

Use strong, unique values and never commit them.

## Project structure

```
backend/              API source code and uploads
frontend-shop-nuxt/   Customer storefront (Nuxt)
frontend-admin/       Admin interface (Vite)
docker/               One Dockerfile per service
docker-compose.yml    Full stack definition
```

## Screenshots

[Add 2 or 3 images here: the storefront, a product page and the admin interface.]

## Author

Steve Sorel Tamwo Motcheyo, systems and networks student at the University of Yaoundé I.
GitHub: https://github.com/Stevesorel

## Licence

MIT, see the `LICENSE` file.
