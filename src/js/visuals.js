import $ from "jquery";

export function randomOffset(num, percentage) {
    const off = (2 * Math.random() - 1) * (percentage / 100) * num;
    return num + off;
}

export function animateCountUp(targets, end, dur, start) {
    $(targets).each(function () {
        const $this = $(this);
        $({Counter: start || 0}).animate({Counter: end || $this.text()}, {
            duration: dur || randomOffset(1500, 10),
            easing: "swing",
            step: function () {
                $this.text(Math.ceil(this.Counter));
            }
        });
    });
}