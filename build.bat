call node_modules\.bin\esbuild src\main.ts --target=es2020 --bundle --platform=node --outfile="../dist/main.js"
node "../dist/main.js"

