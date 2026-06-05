import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/settings");
    const text = await res.text();
    console.log("TEST RESULT:", text.substring(0, 50));
  } catch(e) {
    console.log("TEST ERROR:", e);
  }
}
test();
