// encoding: utf-8

(function (global) {
    'use strict';
    global.Torigoya = global.Torigoya || {};
    global.Torigoya.GfTimer = global.Torigoya.GfTimer || {};
    var GfTimer = global.Torigoya.GfTimer;

    var VERSION = '1';

    GfTimer.Formatter = {
        date: function (date) {
            return date.getFullYear() + '/' +
                    ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
                    ('0' + date.getDate()).slice(-2) + ' ' +
                    ('0' + date.getHours()).slice(-2) + ':' +
                    ('0' + date.getMinutes()).slice(-2)
            ;
        },
    };

    // LocalStorageのラッパー
    GfTimer.Storage = {
        get: function (name) {
            try {
                var result = localStorage[VERSION + '-' + name];
                return result ? JSON.parse(result) : null;
            } catch (e) {
                console.log(e);
                return null;
            }
        },
        set: function (name, value) {
            localStorage[VERSION + '-' + name] = JSON.stringify(value);
        }
    };

    GfTimer.loadGroupSetting = function () {
        var groupsSetting = GfTimer.Storage.get('groups');
        if (groupsSetting) {
            return groupsSetting;
        } else {
            return {
                A: true,
                B: true,
                C: true,
                D: true,
                E: true,
                F: true,
                G: true,
                H: true
            };
        }
    };

    GfTimer.loadSpecialFlagSetting = function () {
        console.log(GfTimer.Storage.get('specialFlag'));
        return !!GfTimer.Storage.get('specialFlag');
    };

    // Alarmのラッパー
    GfTimer.reserveAlarm = function (name, minutesOrDate) {
        if (minutesOrDate instanceof Date) {
            var dateString = GfTimer.Formatter.date(minutesOrDate);
            if (minutesOrDate > (new Date()).getTime()) {
                console.log('reserveAlarm[' + name + ']: ' + dateString);
                chrome.alarms.create(name, {
                    when: minutesOrDate.getTime()
                });
            } else {
                console.log('reserveAlarm[' + name + ']: not reserved (' + dateString + ')');
            }
        } else {
            if (minutesOrDate > 0) {
                console.log('reserveAlarm[' + name + ']: ' + minutesOrDate + 'minutes ago.');
                chrome.alarms.create(name, {
                    delayInMinutes: minutesOrDate
                });
            } else {
                console.log('reserveAlarm[' + name + ']: not reserved (' + minutesOrDate + ' minutes)');
            }
        }
    };
})(this);
