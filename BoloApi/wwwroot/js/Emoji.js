class Emoji extends React.Component {
    constructor(props) {
        super(props);

        this.onEmojiClick = this.onEmojiClick.bind(this);
    }

    onEmojiClick(value) {
        this.props.onSelect(value);
    }

    render() {
        return <div className="emojicont p-2 border-top border-bottom border-right border-left bg-light" style={{ maxWidth: "410px" }}>
            <ul className="list-inline mb-1">
                <li className="list-inline-item"><span title="GRINNING FACE" onClick={() => this.onEmojiClick('😀')}>😀</span></li>
                <li className="list-inline-item"><span title="GRINNING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😁')}>😁</span></li>
                <li className="list-inline-item"><span title="FACE WITH TEARS OF JOY" onClick={() => this.onEmojiClick('😂')}>😂</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😃')}>😃</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND SMILING EYES" onClick={() => this.onEmojiClick('😄')}>😄</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => this.onEmojiClick('😅')}>😅</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES" onClick={() => this.onEmojiClick('😆')}>😆</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HALO" onClick={() => this.onEmojiClick('😇')}>😇</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HORNS" onClick={() => this.onEmojiClick('😈')}>😈</span></li>
                <li className="list-inline-item"><span title="WINKING FACE" onClick={() => this.onEmojiClick('😉')}>😉</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😊')}>😊</span></li>
                <li className="list-inline-item"><span title="FACE SAVOURING DELICIOUS FOOD" onClick={() => this.onEmojiClick('😋')}>😋</span></li>
                <li className="list-inline-item"><span title="RELIEVED FACE" onClick={() => this.onEmojiClick('😌')}>😌</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH HEART-SHAPED EYES" onClick={() => this.onEmojiClick('😍')}>😍</span></li>
                <li className="list-inline-item"><span title="SMILING FACE WITH SUNGLASSES" onClick={() => this.onEmojiClick('😎')}>😎</span></li>
                <li className="list-inline-item"><span title="SMIRKING FACE" onClick={() => this.onEmojiClick('😏')}>😏</span></li>
                <li className="list-inline-item"><span title="NEUTRAL FACE" onClick={() => this.onEmojiClick('😐')}>😐</span></li>
                <li className="list-inline-item"><span title="EXPRESSIONLESS FACE" onClick={() => this.onEmojiClick('😑')}>😑</span></li>
                <li className="list-inline-item"><span title="UNAMUSED FACE" onClick={() => this.onEmojiClick('😒')}>😒</span></li>
                <li className="list-inline-item"><span title="FACE WITH COLD SWEAT" onClick={() => this.onEmojiClick('😓')}>😓</span></li>
                <li className="list-inline-item"><span title="PENSIVE FACE" onClick={() => this.onEmojiClick('😔')}>😔</span></li>
                <li className="list-inline-item"><span title="CONFUSED FACE" onClick={() => this.onEmojiClick('😕')}>😕</span></li>
                <li className="list-inline-item"><span title="CONFOUNDED FACE" onClick={() => this.onEmojiClick('😖')}>😖</span></li>
                <li className="list-inline-item"><span title="KISSING FACE" onClick={() => this.onEmojiClick('😗')}>😗</span></li>
                <li className="list-inline-item"><span title="FACE THROWING A KISS" onClick={() => this.onEmojiClick('😘')}>😘</span></li>
                <li className="list-inline-item"><span title="KISSING FACE WITH SMILING EYES" onClick={() => this.onEmojiClick('😙')}>😙</span></li>
                <li className="list-inline-item"><span title="KISSING FACE WITH CLOSED EYES" onClick={() => this.onEmojiClick('😚')}>😚</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE" onClick={() => this.onEmojiClick('😛')}>😛</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE AND WINKING EYE" onClick={() => this.onEmojiClick('😜')}>😜</span></li>
                <li className="list-inline-item"><span title="FACE WITH STUCK-OUT TONGUE AND TIGHTLY-CLOSED EYES" onClick={() => this.onEmojiClick('😝')}>😝</span></li>
                <li className="list-inline-item"><span title="DISAPPOINTED FACE" onClick={() => this.onEmojiClick('😞')}>😞</span></li>
                <li className="list-inline-item"><span title="WORRIED FACE" onClick={() => this.onEmojiClick('😟')}>😟</span></li>
                <li className="list-inline-item"><span title="ANGRY FACE" onClick={() => this.onEmojiClick('😠')}>😠</span></li>
                <li className="list-inline-item"><span title="POUTING FACE" onClick={() => this.onEmojiClick('😡')}>😡</span></li>
                <li className="list-inline-item"><span title="CRYING FACE" onClick={() => this.onEmojiClick('😢')}>😢</span></li>
                <li className="list-inline-item"><span title="PERSEVERING FACE" onClick={() => this.onEmojiClick('😣')}>😣</span></li>
                <li className="list-inline-item"><span title="FACE WITH LOOK OF TRIUMPH" onClick={() => this.onEmojiClick('😤')}>😤</span></li>
                <li className="list-inline-item"><span title="DISAPPOINTED BUT RELIEVED FACE" onClick={() => this.onEmojiClick('😥')}>😥</span></li>
                <li className="list-inline-item"><span title="FROWNING FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😦')}>😦</span></li>
                <li className="list-inline-item"><span title="ANGUISHED FACE" onClick={() => this.onEmojiClick('😧')}>😧</span></li>
                <li className="list-inline-item"><span title="FEARFUL FACE" onClick={() => this.onEmojiClick('😨')}>😨</span></li>
                <li className="list-inline-item"><span title="WEARY FACE" onClick={() => this.onEmojiClick('😩')}>😩</span></li>
                <li className="list-inline-item"><span title="SLEEPY FACE" onClick={() => this.onEmojiClick('😪')}>😪</span></li>
                <li className="list-inline-item"><span title="TIRED FACE" onClick={() => this.onEmojiClick('😫')}>😫</span></li>
                <li className="list-inline-item"><span title="GRIMACING FACE" onClick={() => this.onEmojiClick('😬')}>😬</span></li>
                <li className="list-inline-item"><span title="LOUDLY CRYING FACE" onClick={() => this.onEmojiClick('😭')}>😭</span></li>
                <li className="list-inline-item"><span title="FACE WITH OPEN MOUTH" onClick={() => this.onEmojiClick('😮')}>😮</span></li>
                <li className="list-inline-item"><span title="HUSHED FACE" onClick={() => this.onEmojiClick('😯')}>😯</span></li>
                <li className="list-inline-item"><span title="FACE WITH OPEN MOUTH AND COLD SWEAT" onClick={() => this.onEmojiClick('😰')}>😰</span></li>
                <li className="list-inline-item"><span title="FACE SCREAMING IN FEAR" onClick={() => this.onEmojiClick('😱')}>😱</span></li>
                <li className="list-inline-item"><span title="ASTONISHED FACE" onClick={() => this.onEmojiClick('😲')}>😲</span></li>
                <li className="list-inline-item"><span title="FLUSHED FACE" onClick={() => this.onEmojiClick('😳')}>😳</span></li>
                <li className="list-inline-item"><span title="SLEEPING FACE" onClick={() => this.onEmojiClick('😴')}>😴</span></li>
                <li className="list-inline-item"><span title="DIZZY FACE" onClick={() => this.onEmojiClick('😵')}>😵</span></li>
                <li className="list-inline-item"><span title="FACE WITHOUT MOUTH" onClick={() => this.onEmojiClick('😶')}>😶</span></li>
                <li className="list-inline-item"><span title="FACE WITH MEDICAL MASK" onClick={() => this.onEmojiClick('😷')}>😷</span></li>
                <li className="list-inline-item"><span title="FROWN FACE" onClick={() => this.onEmojiClick('🙁')}>🙁</span></li>
                <li className="list-inline-item"><span title="SMILING FACE" onClick={() => this.onEmojiClick('🙂')}>🙂</span></li>
                <li className="list-inline-item"><span title="UPSIDEDOWN FACE" onClick={() => this.onEmojiClick('🙃')}>🙃</span></li>
                <li className="list-inline-item"><span title="EYES ROLLING FACE" onClick={() => this.onEmojiClick('🙄')}>🙄</span></li>
                <li className="list-inline-item"><span title="ZIPPED FACE" onClick={() => this.onEmojiClick('🤐')}>🤐</span></li>
                <li className="list-inline-item"><span title="MONEY FACE" onClick={() => this.onEmojiClick('🤑')}>🤑</span></li>
                <li className="list-inline-item"><span title="FEVERISH FACE" onClick={() => this.onEmojiClick('🤒')}>🤒</span></li>
                <li className="list-inline-item"><span title="SPECTACLED FACE" onClick={() => this.onEmojiClick('🤓')}>🤓</span></li>
                <li className="list-inline-item"><span title="WONDERING FACE" onClick={() => this.onEmojiClick('🤔')}>🤔</span></li>
                <li className="list-inline-item"><span title="HURT FACE" onClick={() => this.onEmojiClick('🤕')}>🤕</span></li>
                <li className="list-inline-item"><span title="COWBOY FACE" onClick={() => this.onEmojiClick('🤠')}>🤠</span></li>
                <li className="list-inline-item"><span title="CLOWN FACE" onClick={() => this.onEmojiClick('🤡')}>🤡</span></li>
                <li className="list-inline-item"><span title="SICK VOMIT FACE" onClick={() => this.onEmojiClick('🤢')}>🤢</span></li>
                <li className="list-inline-item"><span title="LAUGHING ROLLING FACE" onClick={() => this.onEmojiClick('🤣')}>🤣</span></li>
                <li className="list-inline-item"><span title="LEERING FACE" onClick={() => this.onEmojiClick('🤤')}>🤤</span></li>
                <li className="list-inline-item"><span title="LEING FACE" onClick={() => this.onEmojiClick('🤥')}>🤥</span></li>
                <li className="list-inline-item"><span title="BLOWING NOSE FACE" onClick={() => this.onEmojiClick('🤧')}>🤧</span></li>
                <li className="list-inline-item"><span title="ROCK FACE" onClick={() => this.onEmojiClick('🤨')}>🤨</span></li>
                <li className="list-inline-item"><span title="STARY EYES FACE" onClick={() => this.onEmojiClick('🤩')}>🤩</span></li>
                <li className="list-inline-item"><span title="MAD FACE" onClick={() => this.onEmojiClick('🤪')}>🤪</span></li>
                <li className="list-inline-item"><span title="SHUSHING FACE" onClick={() => this.onEmojiClick('🤫')}>🤫</span></li>
                <li className="list-inline-item"><span title="CURSING FACE" onClick={() => this.onEmojiClick('🤬')}>🤬</span></li>
                <li className="list-inline-item"><span title="CHUGLI FACE" onClick={() => this.onEmojiClick('🤭')}>🤭</span></li>
                <li className="list-inline-item"><span title="VOMIT FACE" onClick={() => this.onEmojiClick('🤮')}>🤮</span></li>
                <li className="list-inline-item"><span title="MIND BLOWN FACE" onClick={() => this.onEmojiClick('🤯')}>🤯</span></li>
                <li className="list-inline-item"><span title="VICTORIAN FACE" onClick={() => this.onEmojiClick('🧐')}>🧐</span></li>
            </ul>
        </div>;
    }
}