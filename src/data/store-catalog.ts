import managedCatalogJson from "./store-manager-products.json";
import {
  products as legacyProducts,
  formatPrice,
  type Product as LegacyProduct,
} from "./products";

export type ProductVariant = {
  sourceSkuId?: string;
  name: string;
  stock: number;
  price: number;
  attributes?: Record<string, string>;
  image?: string | null;
};

export type Product = Omit<LegacyProduct, "variants"> & {
  variants?: ProductVariant[];
};

type ManagedProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
  editorialAssets?: Array<{ id: string; type: string }>;
  variants?: Array<{
    sourceSkuId: string;
    name: string;
    price: number;
    stock: number;
    attributes?: Record<string, string>;
    imageUrl?: string | null;
  }>;
  category: string;
  ageRange: string;
  stock: number;
  benefits: string[];
  shipping: {
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
};

const managedCatalog = managedCatalogJson as unknown as {
  version: number;
  products: ManagedProduct[];
};

function managedProductToStoreProduct(product: ManagedProduct): Product {
  const editorialGallery = (product.editorialAssets || []).map(
    (asset) => `/products/catalog/${product.id}/${asset.id}.png`,
  );
  const relativeSourceGallery = (product.gallery || []).filter((item) =>
    item.startsWith("/"),
  );
  const gallery =
    editorialGallery.length > 0 ? editorialGallery : relativeSourceGallery;
  const image = gallery[0] || (product.image.startsWith("/") ? product.image : "");

  return {
    id: product.id,
    name: product.title,
    description: product.description,
    price: product.price,
    image,
    gallery,
    variants: (product.variants || []).map((variant) => ({
      sourceSkuId: variant.sourceSkuId,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      attributes: variant.attributes,
      image:
        variant.imageUrl && variant.imageUrl.startsWith("/")
          ? variant.imageUrl
          : null,
    })),
    emoji: "✨",
    category: product.category,
    stock: product.stock,
    ageRange: product.ageRange,
    benefits: product.benefits,
    shipping: product.shipping,
  };
}

const managedProducts = managedCatalog.products.map(managedProductToStoreProduct);

export const products: Product[] = [
  ...(legacyProducts as Product[]),
  ...managedProducts,
];

export const categories = [
  "Todos",
  ...Array.from(new Set(products.map((product) => product.category))),
];

export { formatPrice };
