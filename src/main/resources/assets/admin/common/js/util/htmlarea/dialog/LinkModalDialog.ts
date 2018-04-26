module api.util.htmlarea.dialog {

    import Form = api.ui.form.Form;
    import FormItem = api.ui.form.FormItem;
    import Panel = api.ui.panel.Panel;
    import DockedPanel = api.ui.panel.DockedPanel;
    import Validators = api.ui.form.Validators;
    import Dropdown = api.ui.selector.dropdown.Dropdown;
    import DropdownConfig = api.ui.selector.dropdown.DropdownConfig;
    import Option = api.ui.selector.Option;
    import InputAlignment = api.ui.InputAlignment;
    import TextInput = api.ui.text.TextInput;
    import i18n = api.util.i18n;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    import MediaUploaderEl = api.ui.uploader.MediaUploaderEl;
    import FileUploadedEvent = api.ui.uploader.FileUploadedEvent;
    import FileUploadStartedEvent = api.ui.uploader.FileUploadStartedEvent;
    import UploadItem = api.ui.uploader.UploadItem;
    import MediaSelectorDisplayValue = api.content.media.MediaSelectorDisplayValue;
    import MediaTreeSelectorItem = api.content.media.MediaTreeSelectorItem;
    import ContentSummary = api.content.ContentSummary;
    import FileUploadFailedEvent = api.ui.uploader.FileUploadFailedEvent;
    import BaseSelectedOptionsView = api.ui.selector.combobox.BaseSelectedOptionsView;
    import ContentComboBox = api.content.ContentComboBox;

    export class LinkModalDialog
        extends ModalDialog {
        private dockedPanel: DockedPanel;
        private link: HTMLElement;
        private linkText: string;
        private onlyTextSelected: boolean;
        private textFormItem: FormItem;
        private toolTipFormItem: FormItem;

        private contentId: ContentId;

        private tabNames: any;

        private static contentPrefix: string = 'content://';
        private static downloadPrefix: string = 'media://download/';
        private static emailPrefix: string = 'mailto:';
        private static subjectPrefix: string = '?subject=';

        constructor(config: HtmlAreaAnchor, content: ContentSummary) {
            super(<HtmlAreaModalDialogConfig>{
                editor: config.editor,
                title: i18n('dialog.link.title'),
                cls: 'link-modal-dialog',
                content: content,
                confirmation: {
                    yesCallback: () => this.getSubmitAction().execute(),
                    noCallback: () => this.close(),
                }
            });

            this.link = config.element;
            this.linkText = config.text;

            if (config.anchorList.length > 0) {
                this.dockedPanel.addItem(this.tabNames.anchor, true, this.createAnchorPanel(config.anchorList), this.isAnchor());
            }

            this.onlyTextSelected = config.onlyTextSelected;
            if (this.onlyTextSelected) {
                this.setFirstFocusField(this.textFormItem.getInput());
            } else {
                this.setFirstFocusField(this.toolTipFormItem.getInput());
                this.textFormItem.hide();
                this.textFormItem.removeValidator();
            }
        }

        protected initializeConfig(params: ImageModalDialogConfig) {
            super.initializeConfig(params);
            this.contentId = params.content.getContentId();
        }

        private getHref(): string {
            return this.link ? this.link.getAttribute('href') : api.util.StringHelper.EMPTY_STRING;
        }

        private getLinkText(): string {
            return this.link ? this.link['text'] : this.linkText;
        }

        private getToolTip(): string {
            if (this.link) {
                const linkTitleAttrValue = this.link.getAttribute('title');

                if (linkTitleAttrValue) {
                    return linkTitleAttrValue;
                }
            }

            return api.util.StringHelper.EMPTY_STRING;
        }

        private isContentLink(): boolean {
            return this.getHref().indexOf(LinkModalDialog.contentPrefix) === 0;
        }

        private getContentId(): string {
            if (this.link && this.isContentLink()) {
                return this.getHref().replace(LinkModalDialog.contentPrefix, api.util.StringHelper.EMPTY_STRING);
            }
            return api.util.StringHelper.EMPTY_STRING;
        }

        private isDownloadLink(): boolean {
            return this.getHref().indexOf(LinkModalDialog.downloadPrefix) === 0;
        }

        private getDownloadId(): string {
            return this.isDownloadLink()
                ? this.getHref().replace(LinkModalDialog.downloadPrefix, api.util.StringHelper.EMPTY_STRING)
                : api.util.StringHelper.EMPTY_STRING;
        }

        private isUrl(): boolean {
            return this.link ? !(this.isContentLink() || this.isDownloadLink() || this.isEmail()) : false;
        }

        private getUrl(): string {
            return this.isUrl() ? this.getHref() : api.util.StringHelper.EMPTY_STRING;
        }

        private isEmail(): boolean {
            return this.getHref().indexOf(LinkModalDialog.emailPrefix) === 0;
        }

        private getEmail(): string {
            if (!this.isEmail()) {
                return api.util.StringHelper.EMPTY_STRING;
            }
            let emailArr = this.getHref().split(LinkModalDialog.subjectPrefix);
            return emailArr[0].replace(LinkModalDialog.emailPrefix, api.util.StringHelper.EMPTY_STRING);
        }

        private isAnchor(): boolean {
            return this.getHref().indexOf('#') === 0;
        }

        private getAnchor(): string {
            return this.isAnchor() ? this.getHref() : api.util.StringHelper.EMPTY_STRING;
        }

        private getSubject(): string {
            if (!this.isEmail() || this.getHref().indexOf(LinkModalDialog.subjectPrefix) === -1) {
                return api.util.StringHelper.EMPTY_STRING;
            }
            let emailArr = this.getHref().split(LinkModalDialog.subjectPrefix);
            return decodeURI(emailArr[1].replace(LinkModalDialog.subjectPrefix, api.util.StringHelper.EMPTY_STRING));
        }

        protected layout() {
            super.layout();
            this.appendChildToContentPanel(this.dockedPanel = this.createDockedPanel());
        }

        private createContentPanel(): Panel {
            return this.createFormPanel([
                this.createSelectorFormItem('contentId', i18n('dialog.link.formitem.target'), this.createContentSelector(this.getContentId),
                    true),
                this.createTargetCheckbox('contentTarget', this.isContentLink)
            ]);
        }

        private createDownloadPanel(): Panel {
            return this.createFormPanel([
                this.createSelectorFormItem('downloadId', i18n('dialog.link.formitem.target'),
                    this.createContentSelector(this.getDownloadId, api.schema.content.ContentTypeName.getMediaTypes()))
            ]);
        }

        private createUrlPanel(): Panel {
            return this.createFormPanel([
                this.createFormItemWithPostponedValue('url', i18n('dialog.link.formitem.url'), this.getUrl, Validators.required,
                    'https://example.com/mypage'),
                this.createTargetCheckbox('urlTarget', this.isUrl)
            ]);
        }

        private createAnchorPanel(anchorList: string[]): Panel {
            return this.createFormPanel([
                this.createAnchorDropdown(anchorList)
            ]);
        }

        private createEmailPanel(): Panel {
            let emailFormItem: FormItem = this.createFormItemWithPostponedValue('email', i18n('dialog.link.formitem.email'), this.getEmail,
                LinkModalDialog.validationRequiredEmail);

            emailFormItem.getLabel().addClass('required');

            return this.createFormPanel([
                emailFormItem,
                this.createFormItemWithPostponedValue('subject', i18n('dialog.link.formitem.subject'), this.getSubject)
            ]);
        }

        private static validationRequiredEmail(input: api.dom.FormInputEl): string {
            return Validators.required(input) || Validators.validEmail(input);
        }

        private getTarget(isTabSelected: boolean): boolean {
            return isTabSelected ? !api.util.StringHelper.isBlank(this.link.getAttribute('target')) : false;
        }

        private createTargetCheckbox(id: string, isTabSelectedFn: Function): FormItem {
            let checkbox = api.ui.Checkbox.create().setLabelText(i18n('dialog.link.formitem.openinnewtab')).setInputAlignment(
                InputAlignment.RIGHT).build();

            this.onAdded(() => {
                checkbox.setChecked(this.getTarget(isTabSelectedFn.call(this)));
            });

            let formItemBuilder = new ModalDialogFormItemBuilder(id).setInputEl(checkbox);
            return this.createFormItem(formItemBuilder);
        }

        protected getMainFormItems(): FormItem [] {
            this.textFormItem =
                this.createFormItemWithPostponedValue('linkText', i18n('dialog.link.formitem.text'), this.getLinkText, Validators.required);
            this.toolTipFormItem = this.createFormItemWithPostponedValue('toolTip', i18n('dialog.link.formitem.tooltip'), this.getToolTip);

            return [this.textFormItem, this.toolTipFormItem];
        }

        private createDockedPanel(): DockedPanel {
            this.initTabNames();

            let dockedPanel = new DockedPanel();
            dockedPanel.addItem(this.tabNames.url, true, this.createUrlPanel());
            dockedPanel.addItem(this.tabNames.content, true, this.createContentPanel());
            dockedPanel.addItem(this.tabNames.download, true, this.createDownloadPanel());
            dockedPanel.addItem(this.tabNames.email, true, this.createEmailPanel());

            this.onAdded(() => {
                dockedPanel.getDeck().getPanels().forEach((panel, index) => {
                    if ((index === 1 && this.isContentLink()) ||
                        (index === 2 && this.isDownloadLink()) ||
                        (index === 3 && this.isEmail()) ||
                        (index === 4 && this.isAnchor())) {
                        dockedPanel.selectPanel(panel);
                        return false;
                    }
                });
            });

            return dockedPanel;
        }

        private initTabNames() {
            this.tabNames = {
                url: i18n('dialog.link.tabname.url'),
                content: i18n('dialog.link.tabname.content'),
                download: i18n('dialog.link.tabname.download'),
                email: i18n('dialog.link.tabname.email'),
                anchor: i18n('dialog.link.tabname.anchor')
            };
        }

        protected initializeActions() {
            let submitAction = new api.ui.Action(this.link ? i18n('action.update') : i18n('action.insert'));
            this.setSubmitAction(submitAction);

            this.addAction(submitAction.onExecuted(() => {
                if (this.validate()) {
                    this.createLink();
                    this.close();
                }
            }));

            super.initializeActions();
        }

        private createContentSelector(getValueFn: Function, contentTypeNames?: api.schema.content.ContentTypeName[]) {
            const loaderBuilder = api.content.ContentSummaryOptionDataLoader.create();

            if (contentTypeNames) {
                loaderBuilder.setContentTypeNames(contentTypeNames.map(name => name.toString()));
            }

            const contentSelector = api.content.ContentComboBox.create().setLoader(loaderBuilder.build()).setMaximumOccurrences(1).build();

            this.onAdded(() => {
                contentSelector.setValue(getValueFn.call(this));
            });

            return contentSelector;
        }

        private createSelectorFormItem(id: string, label: string, contentSelector: api.content.ContentComboBox<ContentTreeSelectorItem>,
                                       addValueValidation: boolean = false): FormItem {

            const formItemBuilder = new ModalDialogFormItemBuilder(id, label).setValidator(Validators.required).setInputEl(contentSelector);
            const formItem = this.createFormItem(formItemBuilder);

            const mediaUploader = this.createMediaUploader(contentSelector);
            mediaUploader.insertAfterEl(contentSelector);

            if (!addValueValidation) {
                return formItem;
            }

            contentSelector.onValueChanged((event) => {
                if (contentSelector.getLoader().isLoaded()) {

                    if (event.getNewValue()) {
                        const newValueContent = contentSelector.getContent(new api.content.ContentId(event.getNewValue()));

                        const isMedia = !!newValueContent ? newValueContent.getType().isDescendantOfMedia() : false;

                        new api.content.page.IsRenderableRequest(
                            new api.content.ContentId(event.getNewValue())).sendAndParse().then((renderable: boolean) => {
                            formItem.setValidator(() =>
                                isMedia || renderable ? '' : i18n('dialog.link.formitem.nonrenderable'));
                        });
                    } else {
                        formItem.setValidator(Validators.required);
                    }
                }
            });

            return formItem;
        }

        private createMediaUploader(contentSelector: ContentComboBox<ContentTreeSelectorItem>): MediaUploaderEl {
            const mediaUploader = new MediaUploaderEl({
                params: {
                    parent: this.contentId.toString()
                },
                operation: api.ui.uploader.MediaUploaderElOperation.create,
                name: 'media-selector-upload-el',
                showCancel: false,
                showResult: false,
                maximumOccurrences: 1,
                allowMultiSelection: false
            });

            mediaUploader.onUploadStarted((event: FileUploadStartedEvent<Content>) => {
                event.getUploadItems().forEach((uploadItem: UploadItem<Content>) => {
                    const value = new MediaTreeSelectorItem(null).setDisplayValue(
                        MediaSelectorDisplayValue.fromUploadItem(uploadItem));

                    const option = <api.ui.selector.Option<MediaTreeSelectorItem>>{
                        value: value.getId(),
                        displayValue: value
                    };
                    contentSelector.selectOption(option);
                });
            });

            mediaUploader.onFileUploaded((event: FileUploadedEvent<Content>) => {
                let item = event.getUploadItem();
                let createdContent = item.getModel();

                let selectedOption = contentSelector.getSelectedOptionView().getById(item.getId());
                let option = selectedOption.getOption();
                option.displayValue = new MediaTreeSelectorItem(createdContent);
                option.value = createdContent.getContentId().toString();

                selectedOption.getOptionView().setOption(option);
            });

            mediaUploader.onUploadFailed((event: FileUploadFailedEvent<Content>) => {
                let item = event.getUploadItem();

                let selectedOption = contentSelector.getSelectedOptionView().getById(item.getId());
                if (!!selectedOption) {
                    (<BaseSelectedOptionsView<ContentTreeSelectorItem>>contentSelector.getSelectedOptionView()).removeOption(
                        selectedOption.getOption());
                }
            });

            this.onDragEnter((event: DragEvent) => {
                event.stopPropagation();
                mediaUploader.giveFocus();
                mediaUploader.setDefaultDropzoneVisible(true, true);
            });

            mediaUploader.onDropzoneDragLeave(() => {
                mediaUploader.giveBlur();
                mediaUploader.setDefaultDropzoneVisible(false);
            });

            mediaUploader.onDropzoneDrop(() => {
                mediaUploader.setDefaultDropzoneVisible(false);
            });

            contentSelector.getComboBox().onHidden(() => {
                mediaUploader.hide();
            });
            contentSelector.getComboBox().onShown(() => {
                mediaUploader.show();
            });

            return mediaUploader;
        }

        private createAnchorDropdown(anchorList: string[]): FormItem {
            let dropDown = new Dropdown<string>('anchor', <DropdownConfig<string>>{});

            anchorList.forEach((anchor: string) => {
                dropDown.addOption(<Option<string>>{value: '#' + anchor, displayValue: anchor});
            });

            if (this.getAnchor()) {
                dropDown.setValue(this.getAnchor());
            }

            const formItemBuilder = new ModalDialogFormItemBuilder('anchor', i18n('dialog.link.tabname.anchor')).setValidator(
                Validators.required).setInputEl(dropDown);

            return this.createFormItem(formItemBuilder);
        }

        private validateDockPanel(): boolean {
            let form = <Form>this.dockedPanel.getDeck().getPanelShown().getFirstChild();

            return form.validate(true).isValid();
        }

        protected validate(): boolean {
            let mainFormValid = super.validate();
            let dockPanelValid = this.validateDockPanel();

            return mainFormValid && dockPanelValid;
        }

        private createContentLink(): api.dom.AEl {
            let contentSelector = <api.content.ContentComboBox<ContentTreeSelectorItem>>this.getFieldById('contentId');
            let targetCheckbox = <api.ui.Checkbox>this.getFieldById('contentTarget');

            let linkEl = new api.dom.AEl();
            linkEl.setUrl(LinkModalDialog.contentPrefix + contentSelector.getValue(), targetCheckbox.isChecked() ? '_blank' : null);

            return linkEl;
        }

        private createDownloadLink(): api.dom.AEl {
            let contentSelector = <api.content.ContentComboBox<ContentTreeSelectorItem>>this.getFieldById('downloadId');

            let linkEl = new api.dom.AEl();
            linkEl.setUrl(LinkModalDialog.downloadPrefix + contentSelector.getValue());

            return linkEl;
        }

        private createUrlLink(): api.dom.AEl {
            let url = (<api.ui.text.TextInput>this.getFieldById('url')).getValue();
            let targetCheckbox = <api.ui.Checkbox>this.getFieldById('urlTarget');

            let linkEl = new api.dom.AEl();
            linkEl.setUrl(url, targetCheckbox.isChecked() ? '_blank' : null);

            return linkEl;
        }

        private createAnchor(): api.dom.AEl {
            let anchorName = (<api.ui.text.TextInput>this.getFieldById('anchor')).getValue();

            let linkEl = new api.dom.AEl();
            linkEl.setUrl(anchorName);

            return linkEl;
        }

        private createEmailLink(): api.dom.AEl {
            let email = (<api.ui.text.TextInput>this.getFieldById('email')).getValue();
            let subject = (<api.ui.text.TextInput>this.getFieldById('subject')).getValue();

            let linkEl = new api.dom.AEl();
            linkEl.setUrl(LinkModalDialog.emailPrefix + email + (subject ? LinkModalDialog.subjectPrefix + encodeURI(subject) : ''));

            return linkEl;
        }

        private createLink(): void {
            let linkEl: api.dom.AEl;
            let deck = <api.ui.panel.NavigatedDeckPanel>this.dockedPanel.getDeck();
            let selectedTab = <api.ui.tab.TabBarItem>deck.getSelectedNavigationItem();
            let linkText: string = this.onlyTextSelected ? (<api.ui.text.TextInput>this.getFieldById('linkText')).getValue().trim() : '';
            let toolTip: string = (<api.ui.text.TextInput>this.getFieldById('toolTip')).getValue().trim();

            switch (selectedTab.getLabel()) {
            case (this.tabNames.content):
                linkEl = this.createContentLink();
                break;
            case (this.tabNames.url):
                linkEl = this.createUrlLink();
                break;
            case (this.tabNames.download):
                linkEl = this.createDownloadLink();
                break;
            case (this.tabNames.email):
                linkEl = this.createEmailLink();
                break;
            case (this.tabNames.anchor):
                linkEl = this.createAnchor();
                break;
            }

            if (linkText) {
                linkEl.setHtml(linkText);
            }
            if (toolTip) {
                linkEl.setTitle(toolTip);
            }

            if (this.link) {
                if (!linkText && this.link.hasChildNodes()) {
                    linkEl.setHtml(this.link.innerHTML, false);
                }

                this.link.parentElement.replaceChild(linkEl.getHTMLElement(), this.link);
            } else {
                if (this.onlyTextSelected) {
                    this.getEditor().insertContent(linkEl.toString());
                } else {
                    let linkAttrs = {
                        href: linkEl.getHref(),
                        target: linkEl.getTarget() ? linkEl.getTarget() : null,
                        rel: null,
                        // tslint:disable-next-line:object-literal-key-quotes
                        'class': null,
                        title: linkEl.getTitle()
                    };

                    this.getEditor().execCommand('mceInsertLink', false, linkAttrs);
                }
            }
        }

        protected createFormItemWithPostponedValue(id: string, label: string, getValueFn: Function,
                                                   validator?: (input: api.dom.FormInputEl) => string, placeholder?: string): FormItem {

            const formItemBuilder = new ModalDialogFormItemBuilder(id, label);

            if (validator) {
                formItemBuilder.setValidator(validator);
            }

            if (placeholder) {
                formItemBuilder.setPlaceholder(placeholder);
            }

            const formItem = this.createFormItem(formItemBuilder);

            this.onAdded(() => {
                (<api.dom.InputEl>formItem.getInput()).setValue(getValueFn.call(this));
            });

            return formItem;
        }

        isDirty(): boolean {
            return (<TextInput>this.textFormItem.getInput()).isDirty() || (<TextInput>this.toolTipFormItem.getInput()).isDirty() ||
                   AppHelper.isDirty(this.dockedPanel);
        }
    }

}
