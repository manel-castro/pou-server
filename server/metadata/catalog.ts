interface mockDataInterface {
  id: string;
  title: string;
  body: string;
  price: number;
  currency: string;
  image: string;
  color: string;
}

type metadataObjects<T> = { [P in keyof mockDataInterface]: T };

/**
 * Editable
 */
export const isEditable: metadataObjects<boolean> = {
  id: false,
  title: true,
  body: true,
  price: true,
  currency: true,
  image: true,
  color: true,
};
/**
 * Language
 */
export const language: metadataObjects<any> = {
  id: {
    es: "Id",
  },
  title: {
    es: "Título",
  },
  body: {
    es: "Cuerpo",
  },
  price: {
    es: "Precio",
  },
  currency: {
    es: "Moneda",
  },
  image: {
    es: "Imagen",
  },
  color: {
    es: "Color",
  },
};

export const metadataCatalog = (input: any) => {
  return {
    data: input,
    metadata: {
      isEditable,
      language,
    },
  };
};
