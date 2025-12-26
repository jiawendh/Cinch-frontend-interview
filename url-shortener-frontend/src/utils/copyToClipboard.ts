export async function copyToClipboard(text: string) {
  if (!navigator?.clipboard) {
    throw new Error('Clipboard API not supported');
  }
  await navigator.clipboard.writeText(text);
}
