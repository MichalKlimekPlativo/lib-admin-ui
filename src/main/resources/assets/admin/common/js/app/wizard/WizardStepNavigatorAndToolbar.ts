module api.app.wizard {
    import Toolbar = api.ui.toolbar.Toolbar;
    import TabBarItem = api.ui.tab.TabBarItem;
    import ActivatedEvent = api.ui.ActivatedEvent;

    export class WizardStepNavigatorAndToolbar
        extends api.dom.DivEl {

        static maxFittingWidth: number = 675;

        private static MINIMIZED: string = 'minimized';

        private foldButton: api.ui.toolbar.FoldButton;

        private stepToolbar: Toolbar;

        private stepNavigator: WizardStepNavigator;

        private fittingWidth: number;

        private helpTextToggleButton: api.dom.DivEl;

        constructor(stepNavigator: WizardStepNavigator, stepToolbar?: Toolbar) {
            super('wizard-step-navigator-and-toolbar');
            this.stepNavigator = stepNavigator;
            this.stepToolbar = stepToolbar;
            this.foldButton = new api.ui.toolbar.FoldButton();
            this.fittingWidth = 0;

            this.initListeners();
        }

        private initListeners() {
            this.foldButton.getDropdown().onClicked(() => {
                this.addClass('no-dropdown-hover');
                // Place call in the queue outside of the stack and current context,
                // so the repaint will be triggered between those two calls
                setTimeout(this.removeClass.bind(this, 'no-dropdown-hover'));
            });

            this.stepNavigator.onNavigationItemActivated((event: ActivatedEvent) => {
                const tabBarItem: TabBarItem = this.stepNavigator.getNavigationItem(event.getIndex());
                if (tabBarItem) {
                    this.foldButton.setLabel(tabBarItem.getFullLabel());
                }
            });

            this.stepNavigator.onNavigationItemRemoved(() => this.renumerateSteps());
            this.stepNavigator.onNavigationItemAdded(() => this.renumerateSteps());
        }

        renumerateSteps() {
            if (this.isMinimized()) {
                this.addNumbersToStepLabels(); // updating step numbers
            }
        }

        doRender(): Q.Promise<boolean> {
            return super.doRender().then((rendered) => {
                if (this.stepToolbar) {
                    this.appendChild(this.stepToolbar);
                }
                this.appendChild(this.foldButton);
                this.appendChild(this.stepNavigator);

                this.checkAndMinimize();
                return rendered;
            });
        }

        setupHelpTextToggleButton(): api.dom.DivEl {
            this.helpTextToggleButton = new api.dom.DivEl('help-text-button');

            this.addClass('has-help-text-button');
            this.appendChild(this.helpTextToggleButton);
            this.checkAndMinimize();

            return this.helpTextToggleButton;
        }

        private isStepNavigatorFit(): boolean {
            if (this.stepNavigator.isVisible()) {
                return this.isVisibleStepNavigatorFit();
            }

            return this.isNonVisibleStepNavigatorFit();
        }

        private isVisibleStepNavigatorFit(): boolean {
            // StepNavigator fits if summary width of its steps < width of StepNavigator
            // StepNavigator width is calculated in CSS
            const width = this.stepNavigator.getEl().getWidthWithoutPadding();
            const steps = this.stepNavigator.getChildren();
            const stepMargin = (step) => step.isVisible() ? step.getEl().getWidthWithMargin() : 0;
            const stepsWidth = steps.reduce((totalStepWidth, step) => totalStepWidth + stepMargin(step), 0);

            // Update fitting width to check, when toolbar is minimized
            this.fittingWidth = stepsWidth;

            return width > stepsWidth;
        }

        private isNonVisibleStepNavigatorFit(): boolean {
            // StepNavigator is minimized and not visible, or not rendered yet
            // Check with saved width
            const help = this.helpTextToggleButton;
            const width = (!!help && help.isVisible())
                ? this.getEl().getWidthWithoutPadding() - help.getEl().getWidthWithMargin()
                : this.getEl().getWidthWithoutPadding();

            // Add to pixels delta to made the check work as it should, when scale is not 100%
            const fittingWidth = Math.min(this.fittingWidth, WizardStepNavigatorAndToolbar.maxFittingWidth) + 2;

            return width > fittingWidth;
        }

        checkAndMinimize() {
            const isMinimized: boolean = this.isMinimized();
            const isUpdateNeeded: boolean = this.isStepNavigatorFit() === isMinimized;

            if (isUpdateNeeded) {
                if (isMinimized) {
                    this.maximize();
                } else {
                    this.minimize();
                }
            }
        }

        private isMinimized(): boolean {
            return this.hasClass(WizardStepNavigatorAndToolbar.MINIMIZED);
        }

        private minimize() {
            this.addClass(WizardStepNavigatorAndToolbar.MINIMIZED);
            this.removeChild(this.stepNavigator);
            this.foldButton.push(this.stepNavigator, 300);
            this.addNumbersToStepLabels();
            this.foldButton.setLabel(this.stepNavigator.getSelectedNavigationItem().getFullLabel());
        }

        private maximize() {
            this.removeClass(WizardStepNavigatorAndToolbar.MINIMIZED);
            this.foldButton.pop();
            this.stepNavigator.insertAfterEl(this.foldButton);
            this.removeNumbersFromStepLabels();
        }

        private addNumbersToStepLabels() {
            this.stepNavigator.getNavigationItems().filter((tab: TabBarItem) => this.isTabVisible(tab)).forEach(
                (tab: TabBarItem, index) => tab.numerate(index + 1));
        }

        private isTabVisible(tab: TabBarItem): boolean {
            return tab.getHTMLElement().style.display !== 'none';
        }

        private removeNumbersFromStepLabels() {
            this.stepNavigator.getNavigationItems().forEach(
                (tab: TabBarItem) => tab.unnumerate());
        }

    }
}
