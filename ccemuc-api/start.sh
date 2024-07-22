#!/bin/sh
echo "Running migrations"
npx sequelize-cli db:migrate

echo "Running seeds"
npx sequelize-cli db:seed:all

echo "Starting server"
npm run dev
