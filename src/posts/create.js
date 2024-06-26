"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Referenced @TevinWang’s TypeScript translation from P1: https://github.com/CMU-313/NodeBB/pull/23
const _ = require("lodash");
const meta = require("../meta");
const db = require("../database");
const plugins = require("../plugins");
const user = require("../user");
const topics = require("../topics");
const categories = require("../categories");
const groups = require("../groups");
const utils = require("../utils");
const translate = require("../translate");
module.exports = function (Posts) {
    function addReplyTo(postData, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!postData.toPid) {
                return;
            }
            yield Promise.all([
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.sortedSetAdd(`pid:${postData.toPid}:replies`, timestamp, postData.pid),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.incrObjectField(`post:${postData.toPid}`, 'replies'),
            ]);
        });
    }
    Posts.create = (data) => __awaiter(this, void 0, void 0, function* () {
        // This is an internal method, consider using Topics.reply instead
        const { uid } = data;
        const { tid } = data;
        const content = data.content.toString();
        const timestamp = data.timestamp || Date.now();
        const isMain = data.isMain || false;
        const [isEnglish, translatedContent] = yield translate.translate(data);
        if (!uid && parseInt(uid, 10) !== 0) {
            throw new Error('[[error:invalid-uid]]');
        }
        if (data.toPid && !utils.isNumber(data.toPid)) {
            throw new Error('[[error:invalid-pid]]');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const pid = yield db.incrObjectField('global', 'nextPid');
        let postData = {
            pid: pid,
            uid: uid,
            tid: tid,
            content: content,
            timestamp: timestamp,
            translatedContent: translatedContent,
            isEnglish: isEnglish,
        };
        if (data.toPid) {
            postData.toPid = data.toPid;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.ip && meta.config.trackIpPerPost) {
            postData.ip = data.ip;
        }
        if (data.handle && !parseInt(uid, 10)) {
            postData.handle = data.handle;
        }
        postData.is_anonymous = 'false';
        let result = yield plugins.hooks.fire('filter:post.create', { post: postData, data: data });
        postData = result.post;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        yield db.setObject(`post:${postData.pid}`, postData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const topicData = yield topics.getTopicFields(tid, ['cid', 'pinned']);
        postData.cid = topicData.cid;
        yield Promise.all([
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.sortedSetAdd('posts:pid', timestamp, postData.pid),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.incrObjectField('global', 'postCount'),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            user.onNewPostMade(postData),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            topics.onNewPostMade(postData),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            categories.onNewPostMade(topicData.cid, topicData.pinned, postData),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            groups.onNewPostMade(postData),
            addReplyTo(postData, timestamp),
            Posts.uploads.sync(postData.pid),
        ]);
        result = (yield plugins.hooks.fire('filter:post.get', { post: postData, uid: data.uid }));
        result.post.isMain = isMain;
        plugins.hooks.fire('action:post.save', { post: _.clone(result.post) }).catch((e) => console.error(e));
        return result.post;
    });
};
