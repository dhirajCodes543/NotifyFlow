export default async function sendSms(event) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
}