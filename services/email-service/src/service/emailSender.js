export default async function sendEmail(event) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
}