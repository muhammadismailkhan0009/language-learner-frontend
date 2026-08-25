export interface ProfileMcpBackendPort {
    getMcpUrl(): Promise<string>;
}
