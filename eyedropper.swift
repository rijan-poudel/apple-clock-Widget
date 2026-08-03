import AppKit

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

func hexString(from color: NSColor) -> String {
    guard let c = color.usingColorSpace(.sRGB) else { return "#000000" }
    return String(format: "#%02X%02X%02X",
                  Int((c.redComponent * 255).rounded()),
                  Int((c.greenComponent * 255).rounded()),
                  Int((c.blueComponent * 255).rounded()))
}

final class FlippedView: NSView {
    override var isFlipped: Bool { true }
}

final class RingPreviewView: NSView {
    var color: NSColor = .white
    override func draw(_ dirtyRect: NSRect) {
        guard let ctx = NSGraphicsContext.current?.cgContext else { return }
        ctx.clear(bounds)
        let inset = bounds.width * 0.08
        let rect = bounds.insetBy(dx: inset, dy: inset)
        let lineW = rect.width * 0.16
        ctx.setLineWidth(lineW)
        ctx.setStrokeColor(color.cgColor)
        ctx.strokeEllipse(in: rect)
        let cap = CGFloat(lineW) / 2
        ctx.setFillColor(color.cgColor)
        ctx.fillEllipse(in: CGRect(x: rect.midX - cap, y: rect.midY - cap, width: lineW, height: lineW))
    }
}

final class ConfirmationController: NSObject {
    let color: NSColor
    let hex: String
    var window: NSWindow?

    init(color: NSColor) {
        self.color = color
        self.hex = hexString(from: color)
        super.init()
    }

    @objc func confirmAction(_ sender: Any?) {
        print(hex.lowercased())
        fflush(stdout)
        exit(0)
    }

    @objc func retryAction(_ sender: Any?) {
        window?.close()
        window = nil
        startSampler()
    }

    @objc func cancelAction(_ sender: Any?) {
        print("CANCEL")
        fflush(stdout)
        exit(1)
    }

    func show() {
        let size = NSSize(width: 340, height: 220)
        let win = NSWindow(contentRect: NSRect(origin: .zero, size: size),
                           styleMask: [.borderless], backing: .buffered, defer: false)
        win.level = .floating
        win.backgroundColor = .clear
        win.isOpaque = false
        win.hasShadow = true
        window = win

        let container = FlippedView(frame: NSRect(origin: .zero, size: size))
        container.wantsLayer = true
        container.layer?.backgroundColor = NSColor(calibratedWhite: 0.12, alpha: 0.98).cgColor
        container.layer?.cornerRadius = 20
        container.layer?.borderWidth = 1
        container.layer?.borderColor = NSColor(calibratedWhite: 1, alpha: 0.16).cgColor

        let ring = RingPreviewView(frame: NSRect(x: 24, y: 24, width: 104, height: 104))
        ring.color = color
        container.addSubview(ring)

        let swatch = NSView(frame: NSRect(x: 156, y: 40, width: 66, height: 66))
        swatch.wantsLayer = true
        swatch.layer?.backgroundColor = color.cgColor
        swatch.layer?.cornerRadius = 12
        swatch.layer?.borderWidth = 1
        swatch.layer?.borderColor = NSColor(calibratedWhite: 1, alpha: 0.2).cgColor
        container.addSubview(swatch)

        let hexLabel = NSTextField(labelWithString: hex.lowercased())
        hexLabel.font = NSFont.monospacedSystemFont(ofSize: 22, weight: .semibold)
        hexLabel.textColor = .white
        hexLabel.frame = NSRect(x: 148, y: 18, width: 170, height: 26)
        container.addSubview(hexLabel)

        let divider = NSBox()
        divider.boxType = .separator
        divider.frame = NSRect(x: 16, y: 146, width: size.width - 32, height: 1)
        container.addSubview(divider)

        func button(_ title: String, _ action: Selector) -> NSButton {
            let b = NSButton(title: title, target: self, action: action)
            b.bezelStyle = .rounded
            b.controlSize = .large
            b.font = NSFont.systemFont(ofSize: 13, weight: .medium)
            return b
        }

        let cancel = button("Cancel", #selector(cancelAction(_:)))
        cancel.frame = NSRect(x: 16, y: 166, width: 92, height: 34)
        container.addSubview(cancel)

        let retry = button("Try Again", #selector(retryAction(_:)))
        retry.frame = NSRect(x: 124, y: 166, width: 96, height: 34)
        container.addSubview(retry)

        let confirm = button("Set Color", #selector(confirmAction(_:)))
        confirm.frame = NSRect(x: 236, y: 166, width: 88, height: 34)
        confirm.keyEquivalent = "\r"
        container.addSubview(confirm)

        win.contentView = container
        win.center()
        win.orderFrontRegardless()
        app.activate(ignoringOtherApps: true)
    }
}

var confirmController: ConfirmationController?

func startSampler() {
    let sampler = NSColorSampler()
    sampler.show { color in
        guard let c = color else {
            print("CANCEL")
            fflush(stdout)
            exit(1)
        }
        let ctrl = ConfirmationController(color: c)
        confirmController = ctrl
        ctrl.show()
    }
}

if ProcessInfo.processInfo.environment["EYEDROPPER_CONFIRM"] != nil {
    let ctrl = ConfirmationController(color: NSColor(srgbRed: 0x26 / 255.0, green: 0x53 / 255.0, blue: 0x6a / 255.0, alpha: 1))
    confirmController = ctrl
    ctrl.show()
} else {
    app.activate(ignoringOtherApps: true)
    startSampler()
}
app.run()
