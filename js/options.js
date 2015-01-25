// encoding: utf-8

(function (global) {
    'use strict';
    global.Torigoya = global.Torigoya || {};
    global.Torigoya.GfTimer = global.Torigoya.GfTimer || {};
    var GfTimer = global.Torigoya.GfTimer;

    var initOptionView = function (el) {
        return new Vue({
            el: el,
            data: {
                groups: [],
                flag: false,
                timeout: null
            },
            ready: function () {
                this.groups = GfTimer.loadGroupSetting();
                this.flag = GfTimer.loadSpecialFlagSetting();
            },
            methods: {
                onClickGroup: function (e) {
                    e.preventDefault();
                    var groupName = e.target.getAttribute('data-name');
                    this.groups[groupName] = !this.groups[groupName];
                    this.save();
                },
                onClickFlag: function (e) {
                    this.save();
                },
                save: function () {
                    GfTimer.Storage.set('groups', this.groups);
                    GfTimer.Storage.set('specialFlag', this.flag);

                    if (this.timeout) { clearTimeout(this.timeout); }
                    this.timeout = setTimeout(function () {
                        var date = new Date();
                        date.setSeconds(date.getSeconds() + 1);
                        GfTimer.reserveAlarm('notify', date);
                    }, 3000);
                }
            }
        });
    };

    initOptionView('#js-options');
})(this);
