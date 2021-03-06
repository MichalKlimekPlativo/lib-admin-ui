module api.dom {

    export class WindowDOM {

        private el: any; // Window clashes with api.dom.Window

        private static instance: WindowDOM = new WindowDOM();

        private onBeforeUnloadListeners: { (event: UIEvent): void; }[] = [];

        private onUnloadListeners: { (event: UIEvent): void; }[] = [];

        static get(): WindowDOM {
            return WindowDOM.instance;
        }

        constructor() {
            this.el = window;

            const handle = function (event: UIEvent, listeners: { (event: UIEvent): void; }[]) {
                listeners.forEach(l => l(event));
            };

            this.el.onbeforeunload = event => handle(event, this.onBeforeUnloadListeners);
            this.el.onunload = event => handle(event, this.onUnloadListeners);
        }

        asWindow(): Window {
            return this.el;
        }

        getTopParent(): WindowDOM {

            let parent = this.getParent();
            if (!parent) {
                return null;
            }

            let i = 0;
            do {
                let next = parent.getParent();
                if (!next) {
                    return parent;
                }
                parent = next;
                i++;
            }
            while (i < 10);
            return null;
        }

        getParent(): WindowDOM {
            let parent = this.el.parent;
            if (parent === this.el) {
                return null;
            }
            return parent.api.dom.WindowDOM.get();
        }

        isInIFrame(): boolean {
            return window.self !== window.top;
        }

        getFrameElement(): HTMLElement {
            return this.el.frameElement;
        }

        getHTMLElement(): HTMLElement {
            return this.el;
        }

        getScrollTop(): number {
            return wemjq(this.el).scrollTop();
        }

        onResized(listener: (event: UIEvent) => void, element?: api.dom.Element) {
            this.el.addEventListener('resize', listener);

            if (element) {
                element.onRemoved(() => this.unResized(listener));
            }
        }

        unResized(listener: (event: UIEvent) => void) {
            this.el.removeEventListener('resize', listener);
        }

        getWidth(): number {
            return wemjq(this.el).innerWidth();
        }

        getHeight(): number {
            return wemjq(this.el).innerHeight();
        }

        onScroll(listener: (event: UIEvent) => void, element?: api.dom.Element) {
            this.el.addEventListener('scroll', listener);

            if (element) {
                element.onRemoved(() => this.unScroll(listener));
            }
        }

        unScroll(listener: (event: UIEvent) => void) {
            this.el.removeEventListener('scroll', listener);
        }

        onBeforeUnload(listener: (event: UIEvent) => void) {
            this.onBeforeUnloadListeners.push(listener);
        }

        unBeforeUnload(listener: (event: UIEvent) => void) {
            this.onBeforeUnloadListeners = this.onBeforeUnloadListeners.filter(curr => curr !== listener);
            return this;
        }

        onUnload(listener: (event: UIEvent) => void) {
            this.onUnloadListeners.push(listener);
        }

        unUnload(listener: (event: UIEvent) => void) {
            this.onUnloadListeners = this.onUnloadListeners.filter(curr => curr !== listener);
            return this;
        }

        onFocus(listener: (event: UIEvent) => void) {
            this.el.addEventListener('focus', listener);
        }

        unFocus(listener: (event: UIEvent) => void) {
            this.el.removeEventListener('focus', listener);
        }

        onBlur(listener: (event: UIEvent) => void) {
            this.el.addEventListener('blur', listener);
        }

        unBlur(listener: (event: UIEvent) => void) {
            this.el.removeEventListener('blur', listener);
        }
    }

}
