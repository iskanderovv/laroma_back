import { BadRequestException } from '@nestjs/common';

interface ProductSelectionInput {
  selectedVolume?: string;
  selectedScentCode?: string;
}

interface ProductSelectionSource {
  price: number;
  oldPrice?: number;
  stock?: number;
  volume?: string;
  volumeOptions?: Array<{
    volume: string;
    price: number;
    oldPrice?: number;
    stock?: number;
  }>;
  scents?: Array<{
    code: string;
    label: {
      uz: string;
      ru: string;
    };
  }>;
}

export interface ResolvedProductSelection {
  selectedVolume?: string;
  selectedScentCode?: string;
  selectedScentLabel?: {
    uz: string;
    ru: string;
  };
  price: number;
  oldPrice?: number;
  stock: number;
}

const sanitizeOptionValue = (value?: string | null) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const normalizeOptionValue = (value?: string | null) => sanitizeOptionValue(value).toLowerCase();

const uniqueValues = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = normalizeOptionValue(value);
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

export const getProductVolumeChoices = (product: ProductSelectionSource) => {
  const optionsFromVariants =
    product.volumeOptions
      ?.map((item) => sanitizeOptionValue(item?.volume))
      .filter((item) => item.length > 0) ?? [];

  if (optionsFromVariants.length > 0) {
    return uniqueValues(optionsFromVariants);
  }

  const legacyOptions = product.volume
    ? product.volume
        .split(/[,;|]+/)
        .map((item) => sanitizeOptionValue(item))
        .filter((item) => item.length > 0)
    : [];

  return uniqueValues(legacyOptions);
};

export const getProductScentChoices = (product: ProductSelectionSource) =>
  product.scents?.filter((item) => sanitizeOptionValue(item?.code).length > 0) ?? [];

const resolveSelectionValue = (
  rawValue: string | undefined,
  availableValues: string[],
  fieldLabel: string,
) => {
  if (availableValues.length === 0) {
    const sanitized = sanitizeOptionValue(rawValue);
    return sanitized || undefined;
  }

  const normalizedRaw = normalizeOptionValue(rawValue);

  if (!normalizedRaw) {
    if (availableValues.length === 1) {
      return availableValues[0];
    }

    throw new BadRequestException(`${fieldLabel} selection is required`);
  }

  const matchedValue = availableValues.find(
    (item) => normalizeOptionValue(item) === normalizedRaw,
  );

  if (!matchedValue) {
    throw new BadRequestException(`Invalid ${fieldLabel.toLowerCase()} selection`);
  }

  return matchedValue;
};

export const resolveProductSelection = (
  product: ProductSelectionSource,
  input: ProductSelectionInput = {},
): ResolvedProductSelection => {
  const availableVolumes = getProductVolumeChoices(product);
  const availableScents = getProductScentChoices(product);

  const selectedVolume = resolveSelectionValue(
    input.selectedVolume,
    availableVolumes,
    'Volume',
  );
  const selectedScentCode = resolveSelectionValue(
    input.selectedScentCode,
    availableScents.map((item) => item.code),
    'Scent',
  );
  const matchedScent = selectedScentCode
    ? availableScents.find(
        (item) => normalizeOptionValue(item.code) === normalizeOptionValue(selectedScentCode),
      )
    : undefined;

  const matchedVolumeOption = selectedVolume
    ? product.volumeOptions?.find(
        (item) => normalizeOptionValue(item.volume) === normalizeOptionValue(selectedVolume),
      )
    : undefined;

  return {
    selectedVolume,
    selectedScentCode,
    selectedScentLabel: matchedScent?.label,
    price: matchedVolumeOption?.price ?? product.price,
    oldPrice: matchedVolumeOption?.oldPrice ?? product.oldPrice,
    stock: matchedVolumeOption?.stock ?? product.stock ?? 0,
  };
};
