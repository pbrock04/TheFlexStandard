export default {
  async fetch(request, env, ctx) {
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Flex Standard</title>
  <style>
    body { background-color: #0a0a0b; color: #d4af37; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    h1 { font-size: 2.5rem; letter-spacing: 0.1em; text-align: center; }
  </style>
</head>
<body>
  <h1>THE FLEX STANDARD</h1>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
};
