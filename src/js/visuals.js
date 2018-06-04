import $ from "jquery";

export function randomOffset(num, percentage) {
    const off = (2 * Math.random() - 1) * (percentage / 100) * num;
    return num + off;
}

export function animateCountUp(targets, end, options) {
    options = options || {};
    const counterStart = options.start || 0;
    const animDuration = options.duration || randomOffset(2500, 10);
    const animEasing = options.easing || "swing";

    $(targets).each(function () {
        const $this = $(this);
        $({Counter: counterStart}).animate({Counter: end || $this.text()}, {
            duration: animDuration,
            easing: animEasing,
            step: function () {
                let value;
                if (options.callback) {
                    value = options.callback(this.Counter, this, $this);
                } else {
                    value = Math.ceil(this.Counter);
                }
                $this.text(value);
            }
        });
    });
}