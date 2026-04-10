export default async function sendPush(event) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("Push service failure (test)");
}