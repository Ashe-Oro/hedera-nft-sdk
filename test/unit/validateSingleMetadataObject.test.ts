import { dictionary } from '../../src/utils/constants/dictionary';
import { Hip412Validator } from '../../src/utils/services/Hip412Validator';
import { MetadataObject } from '../../src/types/csv';

const METADATA_OBJECT_WITH_ONLY_REQUIRED_FIELDS = {
  name: 'Example NFT 1',
  image: 'https://nft.com/mycollection/1.jpg',
  type: 'image/jpeg',
};

const METADATA_OBJECT_WITH_REQUIRED_FIELDS_MISSING = {
  name: 'Example NFT 1',
};

const METADATA_OBECT_WITH_ALL_FIELDS = {
  name: 'Example NFT 1',
  creator: 'Hedera',
  description: 'This is an example NFT 1',
  image: 'https://nft.com/mycollection/1.jpg',
  type: 'image/jpeg',
  properties: {
    external_url: 'https://nft.com/mycollection/1',
    url: 'https://nft.com/mycollection/1',
  },
  attributes: [
    { trait_type: 'color', value: 'rgb(0,255,0)' },
    { trait_type: 'hasPipe', value: 'false' },
    { trait_type: 'stamina', value: '65' },
  ],
};

const METADATA_OBJECT_WITH_INVALID_IMAGE_TYPE = {
  name: 'Example NFT 1',
  image: 'https://nft.com/mycollection/1.jpg',
  type: 'text/plain',
};

const METADATA_OBJECT_WITH_INVALID_ATTRIBUTES_STRUCTURE = {
  name: 'Example NFT 1',
  creator: 'Hedera',
  description: 'This is an example NFT 1',
  image: 'https://nft.com/mycollection/1.jpg',
  type: 'image/jpeg',
  properties: {
    external_url: 'https://nft.com/mycollection/1',
    url: 'https://nft.com/mycollection/1',
  },
  attributes: 'This is not a valid attributes structure',
};

const validate = (metadataObject: MetadataObject) => {
  return Hip412Validator.validateSingleMetadataObject(metadataObject);
};

describe('Hip412Validator.validateSingleObject', () => {
  it('should not return any errors for an object with all fields filled properly', () => {
    const validationResult = validate(METADATA_OBECT_WITH_ALL_FIELDS);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors.general).toHaveLength(0);
  });

  it('should not return any errors for an object with only required fields filled', () => {
    const validationResult = validate(METADATA_OBJECT_WITH_ONLY_REQUIRED_FIELDS);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors.general).toHaveLength(0);
  });

  it('should return an error in errors.general for an object missing the image field', () => {
    const validationResult = validate(METADATA_OBJECT_WITH_REQUIRED_FIELDS_MISSING);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors.general).toHaveLength(1);
  });

  it('should return an error for an object with an invalid image MIME type', () => {
    const validationResult = validate(METADATA_OBJECT_WITH_INVALID_IMAGE_TYPE);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors.general).toEqual([
      dictionary.validation.requiredTypeFieldIsMissing,
    ]);
  });

  it('should return an error for an object with an invalid attributes structure', () => {
    const validationResult = validate(METADATA_OBJECT_WITH_INVALID_ATTRIBUTES_STRUCTURE);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors.general).toEqual([
      dictionary.validation.requiredAttributeFieldMissing,
    ]);
  });
});
