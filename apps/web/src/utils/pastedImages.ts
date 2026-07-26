const pastedImageFiles = new Map<string, File>()

export function createPastedImageUrl(file: File) {
  const url = URL.createObjectURL(file)
  pastedImageFiles.set(url, file)
  return url
}

export function getPastedImageFile(url: string) {
  return pastedImageFiles.get(url)
}
