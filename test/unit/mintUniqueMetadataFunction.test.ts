import * as fs from 'fs';
import { MintUniqueTokenType } from '../../src/types/mintToken';
import { mintUniqueMetadataFunction } from '../../src/functions/mintUniqueMetadataFunction';
import { Client, PrivateKey } from '@hashgraph/sdk';
import { mintToken } from '../../src/functions/mintToken';
import { myPrivateKey } from '../__mocks__/consts';

jest.mock('fs');
jest.mock('csv-parser');
jest.mock('../../src/functions/mintToken');

describe('mintUniqueMetadataFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success metadata when given valid input', async () => {
    const mockClient = {} as Client;
    const supplyKey = PrivateKey.fromString(myPrivateKey);

    const mockReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (event, handler) {
        if (event === 'data') {
          handler({ '0': 'url1,url2' });
        }
        if (event === 'end') {
          handler();
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

    (mintToken as jest.Mock).mockResolvedValueOnce({
      serials: Array.from({ length: 2 }, (_, i) => ({
        toNumber: () => i + 1,
      })),
    });

    const input: MintUniqueTokenType = {
      client: mockClient,
      tokenId: 'mockTokenId',
      batchSize: 5,
      pathToCSV: 'mockPath',
      supplyKey: supplyKey,
    };

    const result = await mintUniqueMetadataFunction(input);

    expect(result).toEqual([
      { content: 'url1', serialNumber: 1 },
      { content: 'url2', serialNumber: 2 },
    ]);
    expect(fs.createReadStream).toHaveBeenCalledWith('mockPath');
    expect(mintToken).toHaveBeenCalledTimes(1);
    expect(mintToken).toHaveBeenNthCalledWith(1, ['url1', 'url2'], 'mockTokenId', supplyKey, {});
  });

  it('should throw an error when the CSV contains invalid data', async () => {
    const mockClient = {} as Client;

    const mockReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (event, handler) {
        if (event === 'data') {
          handler({ '0': 123 });
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);

    const input: MintUniqueTokenType = {
      client: mockClient,
      tokenId: 'mockTokenId',
      pathToCSV: 'mockPath',
      supplyKey: PrivateKey.fromString(myPrivateKey),
    };

    await expect(mintUniqueMetadataFunction(input)).rejects.toThrow('Invalid data: 123');
    expect(fs.createReadStream).toHaveBeenCalledWith('mockPath');
  });
});
