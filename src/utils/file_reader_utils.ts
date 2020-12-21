export const getArrayBuffer = async (image: File): Promise<ArrayBuffer> => {
  const fileReader = new FileReader()

  return new Promise((resolve: Function) => {
    fileReader.onload = function () {
      const fileBuffer: ArrayBuffer = <ArrayBuffer> fileReader.result

      resolve(fileBuffer)
    }
    fileReader.readAsArrayBuffer(image)
  })
}
