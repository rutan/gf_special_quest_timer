// encoding: utf-8

(function (global) {
    'use strict';
    global.Torigoya = global.Torigoya || {};
    global.Torigoya.GfTimer = global.Torigoya.GfTimer || {};
    var GfTimer = global.Torigoya.GfTimer;

    var API_URL = 'http://gf.rutan.info/api/v1/special_quest_time.json';

    // fetch
    var fetch = function () {
        $.ajax({
            type: 'get',
            url: API_URL,
            success: function (res) {
                console.log(res.result);
                if (GfTimer.Storage.get('date') != res.result.date) {
                    GfTimer.Storage.set('time_table', res.result.time_table);
                    GfTimer.Storage.set('date', res.result.date);
                    reserveFetchTomorrow();
                    notify();
                } else {
                    GfTimer.reserveAlarm('fetch', 1);
                }
            },
            error: function (e) {
                console.log(e);
                GfTimer.reserveAlarm('fetch', 1);
            }
        });
    };

    // 現在時刻とリストを照らしあわせて条件に合う場合は通知を行う
    var notify = function () {
        var time_table = GfTimer.Storage.get('time_table');
        if (!time_table) {
            fetch();
            return;
        };

        var groupSetting = GfTimer.loadGroupSetting();
        var nowHour = (new Date()).getHours();
        for (var i = 0; i < time_table.length; ++i) {
            // グループID判定
            if (!groupSetting[time_table[i].group]) continue;

            var schedules = time_table[i].schedules;
            for (var j = 0; j < schedules.length; ++j) {
                if (nowHour != schedules[j].hour) continue;
                if (GfTimer.loadSpecialFlagSetting() && !schedules[j].special) continue;
                popupNotification(time_table[i].group, nowHour, schedules[j].special);
            }
        }
    };

    // 通知 + 1時間後の予約
    // 1時間おきに定期実行する関数
    var notifyAndReserve = function () {
        notify();
        reserveNextNotication();
    };

    // ポップアップ通知の表示
    var popupNotification = function (groupID, hour, specialFlag) {
        chrome.notifications.create('', {
            title: '【' + groupID + 'グループ】時限クエスト開催',
            message: hour + '時' + '（' + (specialFlag ? '☆' : '通常') + '）',
            type: 'basic',
            iconUrl: 'icons/128.png'
        }, function(){});
    };

    // 日付変わったときに再取得のため起動する
    var reserveFetchTomorrow = function () {
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0);
        tomorrow.setHours(0);
        tomorrow.setMinutes(1);
        GfTimer.reserveAlarm('fetch', tomorrow);
    };

    // 1時間後の通知を設定する
    var reserveNextNotication = function () {
        var nextTime = new Date();
        nextTime.setHours(nextTime.getHours() + 1);
        nextTime.setMinutes(0);
        nextTime.setSeconds(0);
        GfTimer.reserveAlarm('notify-and-reserve', nextTime);
    };

    var launchGame = function () {
        chrome.management.launchApp('eablgejicbklomgaiclcolfilbkckngf');
    };

    var getTodayString = function () {
        var now = new Date();
        return '' + now.getFullYear() + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2);
    };

    var init = function () {
        if (GfTimer.Storage.get('date') != getTodayString()) {
            fetch();
        } else {
            console.log('load cache');
            console.log(GfTimer.Storage.get('time_table'));
            reserveFetchTomorrow();
            notify();
        }
    };

    chrome.runtime.onStartup.addListener(init);
    chrome.runtime.onInstalled.addListener(init);
    chrome.notifications.onClicked.addListener(function (id) {
        chrome.notifications.clear(id, function(){});
        launchGame();
    });
    chrome.notifications.onClosed.addListener(function (id) {
        chrome.notifications.clear(id, function(){});
    });
    chrome.alarms.onAlarm.addListener(function (alarm) {
        if (!alarm) { return }
        console.log('onAlarm[' + alarm.name + ']');
        switch (alarm.name) {
            case 'fetch':
                return fetch();
            case 'notify':
                return notify();
            case 'notify-and-reserve':
                return notifyAndReserve();
        }
    });
})(this);
