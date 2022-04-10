export type ApiResult = {
  stdout: string;
  stderr: string;
  status: number | null;
  error?: Error;
};
