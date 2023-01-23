import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";

export const getPdfReadableStream = async (user, userId) => {
  const createBase64Image = async (url) => {
    const encodedbase64 = await imageToBase64(url);
    console.log(encodedbase64);
    return "data:image/jpeg;base64, " + encodedbase64;
    // return encodedbase64;
  };

  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const content = [
    { text: "CV", style: "header", alignment: "center" },
    {
      text: `Name: ${user.name} ${user.surname}`,
      style: "subheader",
    },
    { image: "postImage", width: 150, height: 150 },
    { text: `email: ${user.email}`, style: "subheader" },
    {
      text: `Currently working as: ${user.title} in ${user.area}`,
      style: "subheader",
    },
  ];

  const docDefinition = {
    content: [...content],
    defaultStyle: {
      font: "Helvetica",
    },
    images: { postImage: await createBase64Image(user.image) },
    // images: { postImage: user.image.toString() },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        font: "Helvetica",
      },
      subheader: {
        fontSize: 15,
        bold: false,
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();
  return pdfReadableStream;
};

// const content = [
//   { text: "CV", style: "header", alignment: "center" },
//   {
//     text: `Name: ${searchedUser.name} ${searchedUser.surname}`,
//     style: "subheader",
//   },
//   // { image: user.image, width: 150, height: 150 },
//   //images support urls or .jpeg/.png
//   // { image: "sampleImage.jpg", width: 150, height: 150 },
//   { text: `email: ${searchedUser.email}`, style: "subheader" },
//   {
//     text: `Currently working as Title: ${searchedUser.title} in ${searchedUser.area}`,
//     style: "subheader",
//   },
//   // { text: "Experiences", style: "header" },
//   // {
//   //   ol: [
//   //     user.experiences.map(exp => ...)
//   //   ],
//   // },
// ];
