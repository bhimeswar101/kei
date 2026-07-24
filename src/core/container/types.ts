export type ServiceKey = string | symbol;

export type ServiceFactory<T> = () => T;