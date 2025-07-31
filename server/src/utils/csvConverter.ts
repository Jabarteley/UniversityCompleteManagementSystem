import { Parser } from 'json2csv';

export const convertJsonToCsv = (data: any[], fields?: string[]): string => {
  try {
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    return csv;
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    throw new Error('Failed to convert JSON to CSV');
  }
};
