import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";

export const getPdfReadableStream = async (user, userId) => {
  const createBase64Image = async (url) => {
    const encodedbase64 = await imageToBase64(url);
    // console.log(encodedbase64);
    return "data:image/jpeg;base64, " + encodedbase64;
    // return encodedbase64;
  };
  console.log("user.image", user.image);
  console.log("user.experience", user.experience);

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
    {
      text: "Custom CV\n\n\n\n",
      style: "header",
      alignment: "center",
      color: "grey",
    },
    {
      columns: [
        { image: "postImage", width: 80, height: 80 },
        [
          { text: "\n" },
          { text: `${user.name} ${user.surname}`, lineHeight: 2 },
          { text: `${user.email}`, style: "", lineHeight: 2 },
          { text: `${user.title} in ${user.area}`, style: "" },
        ],
      ],
    },
    { text: "\n\n", decoration: "underline", decorationColor: "red" },
    {
      columns: [
        { text: "Work Experience:", style: "header" },
        {
          ol: user.experience.map((exp, i) => {
            return {
              text: `${exp.role} at ${exp.company}`,
              lineHeight: 1.5,
            };
          }),
        },
      ],
    },
  ];

  // const content = [
  //   { text: "CV", style: "header", alignment: "center" },
  //   {
  //     text: `Name: ${user.name} ${user.surname}`,
  //     style: "subheader",
  //   },
  //   { image: "postImage", width: 80, height: 80 },
  //   { text: `email: ${user.email}`, style: "subheader" },
  //   {
  //     text: `Currently working as: ${user.title} in ${user.area}`,
  //     style: "subheader",
  //   },
  //   { text: `Experience: `, style: "header" },
  //   {
  //     // ol: user.experience.map((exp, i) => {
  //     //   return {
  //     //     text: exp.role,
  //     //   };
  //     // }),
  //     ol: user.experience.map((exp, i) => ({
  //       text: exp.role,
  //     })),
  //   },
  // ];

  const docDefinition = {
    content: [...content],
    defaultStyle: {
      font: "Helvetica",
      color: "grey",
      columnGap: 20,
    },
    images: { postImage: await createBase64Image(user.image) },
    // images: { postImage: user.image.toString() },
    styles: {
      header: {
        fontSize: 15,
        bold: true,
        font: "Helvetica",
      },
      subheader: {
        fontSize: 15,
        bold: false,
      },
    },
    // defaultStyle: {
    //   columnGap: 20,
    // },
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
