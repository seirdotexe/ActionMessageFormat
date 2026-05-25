export function isNativeObject(protoObj: any): boolean;
export function determineArray(arr: any[]): {
    associative: boolean;
    sparse: boolean;
    dense: boolean;
};
