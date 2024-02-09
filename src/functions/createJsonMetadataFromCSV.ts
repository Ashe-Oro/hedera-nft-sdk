import { CSVFileReader } from '../CSVFileReader';
import { JsonMetadataFromCSVConverter } from '../utils/services/JsonMetadataFromCSVConverter';
import { JsonMetadataFromCSVInterface } from '../types/jsonMetadataFromCSV';
import { Hip412Validator } from '../utils/services/Hip412Validator';

export const createJsonMetadataFromCSV = async ({
  savedJsonFilesLocation,
  csvFilePath,
  nftsLimit,
}: {
  savedJsonFilesLocation: string;
  csvFilePath: string;
  nftsLimit?: number;
}): Promise<JsonMetadataFromCSVInterface> => {
  const csvParsedRows = await CSVFileReader.readCSVFile(csvFilePath, {
    limit: nftsLimit,
  });

  const metadataObjectsFromCSVRows = JsonMetadataFromCSVConverter.parseCSVRowsToMetadataObjects({
    csvParsedRows,
    csvFilePath,
    headerAttributes: CSVFileReader.ATTRIBUTES,
    headerProperties: CSVFileReader.PROPERTIES,
  });

  const { metadataObjectsValidationErrors, missingAttributesErrors } =
    Hip412Validator.validateArrayOfObjects(metadataObjectsFromCSVRows, csvFilePath);

  JsonMetadataFromCSVConverter.saveCSVRowsAsJsonFiles(
    metadataObjectsFromCSVRows,
    savedJsonFilesLocation
  );

  return {
    errors: {
      metadataObjectsValidationErrors,
      missingAttributesErrors,
    },
    savedJsonFilesLocation,
  };
};
