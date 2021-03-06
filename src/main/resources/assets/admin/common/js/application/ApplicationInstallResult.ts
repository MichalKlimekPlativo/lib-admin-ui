module api.application {

    import Application = api.application.Application;
    import ApplicationInstallResultJson = api.application.json.ApplicationInstallResultJson;

    export class ApplicationInstallResult
        implements api.Equitable {

        private application: Application;

        private failure: string;

        setFailure(value: string) {
            this.failure = value;
        }

        setApplication(application: Application) {
            this.application = application;
        }

        public getApplication(): Application {
            return this.application;
        }

        public getFailure(): string {
            return this.failure;
        }

        equals(o: api.Equitable): boolean {

            if (!api.ObjectHelper.iFrameSafeInstanceOf(o, ApplicationInstallResult)) {
                return false;
            }

            let other = <ApplicationInstallResult>o;
            return api.ObjectHelper.stringEquals(this.failure, other.failure) &&
                   api.ObjectHelper.equals(this.application, other.application);
        }

        static fromJson(json: ApplicationInstallResultJson): ApplicationInstallResult {
            let result = new ApplicationInstallResult();
            result.application = json.applicationInstalledJson ? Application.fromJson(json.applicationInstalledJson) : null;
            result.failure = json.failure;
            return result;
        }
    }
}
