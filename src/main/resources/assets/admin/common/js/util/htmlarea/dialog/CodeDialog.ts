module api.util.htmlarea.dialog {

    import TextArea = api.ui.text.TextArea;
    import Action = api.ui.Action;
    import i18n = api.util.i18n;
    import editor = CKEDITOR.editor;

    export class CodeDialog extends ModalDialog {

        private textArea: TextArea;

        private okAction: Action;

        constructor(editor: editor) {
            super(<HtmlAreaModalDialogConfig>{
                editor: editor,
                title: i18n('dialog.sourcecode.title'), cls: 'source-code-modal-dialog',
                confirmation: {
                    yesCallback: () => this.okAction.execute(),
                    noCallback: () => this.close(),
                }
            });
        }

        protected layout() {
            super.layout();

            this.textArea = new TextArea('source-textarea');
            this.appendChildToContentPanel(this.textArea);
        }

        open() {
            super.open();

            this.textArea.setValue(this.getEditor().getSnapshot());
            this.getEl().setAttribute('spellcheck', 'false');
            this.resetHeight();
            this.textArea.giveFocus();
            this.centerMyself();
        }

        private resetHeight() {
            const size: any = CKEDITOR.document.getWindow().getViewPaneSize();
            const height: number = Math.min(size.height, 500);

            this.textArea.getEl().setMinHeightPx(height);
            this.textArea.getEl().setMaxHeightPx(height);
        }

        protected initializeActions() {
            this.okAction = new Action(i18n('action.ok'));

            this.addAction(this.okAction.onExecuted(() => {
                this.getEditor().focus();
                this.getEditor().setData(this.textArea.getValue());
                this.close();
            }));

            super.initializeActions();
        }

        isDirty(): boolean {
            return this.textArea.isDirty();
        }
    }
}
