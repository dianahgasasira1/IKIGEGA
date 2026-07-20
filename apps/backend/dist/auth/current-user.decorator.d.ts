export type AuthenticatedUser = {
    userId: string;
    phoneNumber: string;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
