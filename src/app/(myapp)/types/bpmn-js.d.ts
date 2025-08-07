// BPMN.js internal service types
interface BpmnCanvas {
  zoom(): number;
  zoom(level: number | string): void;
  viewbox(): { x: number; y: number; width: number; height: number };
  get(service: 'container'): HTMLElement;
  get(service: string): unknown;
  _container?: HTMLElement;
}

interface BpmnEventBus {
  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
}

interface BpmnKeyboard {
  isKey(keys: string[], event: KeyboardEvent): boolean;
  isCmd(event: KeyboardEvent): boolean;
  addListener(listener: (context: { keyEvent: KeyboardEvent }) => boolean | undefined): void;
  removeListener(listener: (context: { keyEvent: KeyboardEvent }) => boolean | undefined): void;
}

declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnJS {
    constructor(options: {
      container: HTMLElement;
      propertiesPanel?: { parent: string };
      additionalModules?: unknown[];
      moddleExtensions?: Record<string, unknown>;
    });
    get(service: 'canvas'): BpmnCanvas;
    get(service: 'eventBus'): BpmnEventBus;
    get(service: 'keyboard'): BpmnKeyboard;
    get(service: string): unknown;
    on(event: string, callback: () => void): void;
    off(event: string, callback: () => void): void;
    importXML(xml: string): Promise<{ warnings: string[] }>;
    saveXML(options?: { format?: boolean }): Promise<{ xml: string }>;
    destroy(): void;
  }
}
