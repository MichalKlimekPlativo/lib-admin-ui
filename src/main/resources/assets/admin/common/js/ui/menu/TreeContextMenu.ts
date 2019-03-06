module api.ui.menu {

    export class TreeContextMenu
        extends api.dom.DlEl {

        private itemClickListeners: { (): void }[] = [];

        private itemExpandedListeners: { (heightChange: number): void }[] = [];

        private actions: api.ui.Action[] = [];

        constructor(actions?: api.ui.Action[], appendToBody: boolean = true) {
            super('context-menu');

            if (actions) {
                actions.sort(function (action1: api.ui.Action, action2: api.ui.Action) {
                    return action1.getSortOrder() - action2.getSortOrder();
                }).forEach((action: api.ui.Action) => {
                    this.addAction(action);
                });
            }

            if (appendToBody) {
                api.dom.Body.get().appendChild(this);
                api.dom.Body.get().onClicked((event: MouseEvent) => this.hideMenuOnOutsideClick(event));
            }

            this.onClicked((e: MouseEvent) => {
                // menu itself was clicked so do nothing
                e.preventDefault();
                e.stopPropagation();
            });
        }

        private addAction(action: api.ui.Action): TreeMenuItem {
            const childActions = action.getChildActions();
            const menuItem = this.createMenuItem(action);
            this.appendChild(menuItem);
            this.actions.push(action);

            if (childActions.length > 0) {
                const subItems = action.getChildActions().map(a => this.addAction(a));
                menuItem.onClicked(() => {
                    const oldHeight = this.getEl().getHeightWithBorder();
                    subItems.forEach(item => item.toggleExpand());
                    const newHeight = this.getEl().getHeightWithBorder();
                    if (subItems.length > 0) {
                        this.notifyItemExpanded(newHeight - oldHeight);
                    }
                });
            } else {

                menuItem.onClicked((event: MouseEvent) => {
                    this.notifyItemClicked();

                    event.preventDefault();
                    event.stopPropagation();
                });
            }
            action.onPropertyChanged(changedAction => {
                menuItem.setEnabled(changedAction.isEnabled());
                menuItem.setVisible(changedAction.isVisible());
            });

            return menuItem;
        }

        addActions(actions: api.ui.Action[]): TreeContextMenu {
            actions.forEach((action) => {
                this.addAction(action);
            });
            return this;
        }

        setActions(actions: api.ui.Action[]): TreeContextMenu {
            this.removeChildren();

            this.actions = [];

            this.addActions(actions);
            return this;
        }

        onItemClicked(listener: () => void) {
            this.itemClickListeners.push(listener);
        }

        unItemClicked(listener: () => void) {
            this.itemClickListeners = this.itemClickListeners.filter((currentListener: () => void) => {
                return listener !== currentListener;
            });
        }

        private notifyItemClicked() {
            this.itemClickListeners.forEach((listener: () => void) => {
                listener();
            });
        }

        onItemExpanded(listener: (heightChange: number) => void) {
            this.itemExpandedListeners.push(listener);
        }

        unItemExpanded(listener: (heightChange: number) => void) {
            this.itemExpandedListeners = this.itemExpandedListeners.filter((currentListener: (heightChange: number) => void) => {
                return listener !== currentListener;
            });
        }

        private notifyItemExpanded(heightChange: number) {
            this.itemExpandedListeners.forEach((listener: (heightChange: number) => void) => {
                listener(heightChange);
            });
        }

        onBeforeAction(listener: (action: api.ui.Action) => void) {
            this.actions.forEach((action: api.ui.Action) => {
                action.onBeforeExecute(listener);
            });
        }

        unBeforeAction(listener: (action: api.ui.Action) => void) {
            this.actions.forEach((action: api.ui.Action) => {
                action.unBeforeExecute(listener);
            });
        }

        onAfterAction(listener: (action: api.ui.Action) => void) {
            this.actions.forEach((action: api.ui.Action) => {
                action.onAfterExecute(listener);
            });
        }

        unAfterAction(listener: (action: api.ui.Action) => void) {
            this.actions.forEach((action: api.ui.Action) => {
                action.unAfterExecute(listener);
            });
        }

        showAt(x: number, y: number) {
            // referencing through prototype to be able to call this function with context other than this
            // i.e this.showAt.call(other, x, y)
            TreeContextMenu.prototype.doMoveTo(this, x, y);
            this.show();
        }

        moveBy(dx: number, dy: number) {
            let offset = this.getEl().getOffsetToParent();
            // referencing through prototype to be able to call this function with context other than this
            // i.e this.moveBy.call(other, x, y)
            TreeContextMenu.prototype.doMoveTo(this, offset.left + dx, offset.top + dy);
        }

        private doMoveTo(menu: TreeContextMenu, x: number, y: number) {
            menu.getEl().setLeftPx(x).setTopPx(y);
        }

        private createMenuItem(action: api.ui.Action): TreeMenuItem {
            return new TreeMenuItem(action, action.getIconClass());
        }

        private hideMenuOnOutsideClick(evt: Event): void {
            if (!this.getEl().contains(<HTMLElement> evt.target)) {
                // click outside menu
                this.hide();
            }
        }
    }

}
