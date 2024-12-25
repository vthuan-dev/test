type NonNullableData<T> = T extends null | undefined ? never : T;
