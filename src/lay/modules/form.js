/**

 @Name：layui.form 表单组件
 @Author：贤心
 @License：MIT

 */

layui.define('layer', function(exports) {
    'use strict'

    let $ = layui.$
    let layer = layui.layer
    let hint = layui.hint()
    let device = layui.device()

    let MOD_NAME = 'form',
        ELEM = '.layui-form',
        THIS = 'layui-this',
        HIDE = 'layui-hide',
        DISABLED = 'layui-disabled',
        Form = function() {
            this.config = {
                verify: {
                    required: [/[\S]+/, '必填项不能为空'],
                    phone: [/^1\d{10}$/, '请输入正确的手机号'],
                    email: [
                        /^([-a-zA-Z0-9_.])+@(([-a-zA-Z0-9])+\.)+([a-zA-Z0-9]{2,4})+$/,
                        '邮箱格式不正确'
                    ],
                    url: [/(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/, '链接格式不正确'],
                    number: function(value) {
                        value = $.trim(value)
                        if (!value || isNaN(value)) return '只能填写数字'
                    },
                    /**
                     * 整数
                     */
                    digit: function(value) {
                        value = $.trim(value)
                        if (!value || isNaN(value) || /[.e]/.test(value)) return '只能填写整数'
                    },
                    date: [
                        /^(\d{4})[-/](\d|0\d|1[0-2])([-/](\d|0\d|[1-2][0-9]|3[0-1]))*$/,
                        '日期格式不正确'
                    ],
                    identity: [/(^\d{15}$)|(^\d{17}(x|X|\d)$)/, '请输入正确的身份证号']
                }
            }
        }

    //全局设置
    Form.prototype.set = function(options) {
        let that = this
        $.extend(true, that.config, options)
        return that
    }

    //验证规则设定
    Form.prototype.verify = function(settings) {
        let that = this
        $.extend(true, that.config.verify, settings)
        return that
    }

    //表单事件监听
    Form.prototype.on = function(events, callback) {
        return layui.onevent.call(this, MOD_NAME, events, callback)
    }

    //初始赋值
    Form.prototype.val = function(filter, object) {
        let formElem = $(ELEM + '[lay-filter="' + filter + '"]')

        formElem.each(function(index, item) {
            let itemFrom = $(item)
            layui.each(object, function(key, value) {
                let itemElem = itemFrom.find('[name="' + key + '"]')
                let type

                //如果对应的表单不存在，则不执行
                if (!itemElem[0]) return
                type = itemElem[0].type

                //如果为复选框
                if (type === 'checkbox') {
                    itemElem[0].checked = value
                } else if (type === 'radio') {
                    //如果为单选框
                    itemElem.each(function() {
                        if (this.value === value) {
                            this.checked = true
                        }
                    })
                } else {
                    //其它类型的表单
                    itemElem.val(value)
                }
            })
        })
        form.render(null, filter)
    }

    //表单控件渲染
    Form.prototype.render = function(type, filter, elFilter) {
        let that = this,
            elemForm = $(ELEM + (filter ? '[lay-filter="' + filter + '"]' : '')),
            items = {
                //下拉选择框
                select: function() {
                    let cache = {}
                    let uuid = 0

                    let TIPS = '请选择',
                        CLASS = 'layui-form-select',
                        TITLE = 'layui-select-title',
                        NONE = 'layui-select-none',
                        CLASS_MULTI = 'layui-form-select-multi',
                        MULTI = 'lay-multi',
                        initValue = '',
                        thatInput,
                        selects = elemForm.find('select'),
                        layerIndex = -1,
                        layerObj,
                        hide = function(e, clear) {
                            if (
                                !$(e.target)
                                    .parent()
                                    .hasClass(TITLE) ||
                                clear
                            ) {
                                $('.' + CLASS).removeClass(CLASS + 'ed ' + CLASS + 'up')
                                thatInput && initValue && thatInput.val(initValue)
                                layer.close(layerIndex)
                                layerObj = null
                            }
                            thatInput = null
                        },
                        events = function(reElem, disabled, isSearch) {
                            let select = $(this)
                            let fieldName = select.attr('name') || select.attr('_name')
                            let title = reElem.find('.' + TITLE)
                            let input = title.find('input')
                            let dl
                            let dds
                            let uuid = select.data('uuid')
                            let cacheObj = cache[uuid]
                            if (disabled) return

                            /**
                             * 更新弹层及 input 输入框
                             * 当下拉框的弹层消失，$option 不存在
                             * @param $option
                             * @param type
                             * @param value
                             */
                            function updateSelectValue($option, type, value) {
                                let $opt
                                let val

                                if ($option) {
                                    $opt = $option && $option.clone()
                                    $opt.children().remove()
                                    val = $opt.html()
                                }

                                let $input = reElem.find('input')
                                let $div = reElem.find('div.layui-input')

                                if (type === 'add') {
                                    $option && $option.addClass(THIS)
                                    let $input = (cacheObj.inputs[value] = $(
                                        `<input type="hidden" name="${fieldName}" value="${value}">`
                                    ))

                                    reElem.append($input)

                                    let $tag = $(
                                        `<div class="layui-btn layui-btn-sm layui-btn-primary" lay-value="${value}">${val}<i class="layui-icon">&#x1006;</i></div>`
                                    )
                                    cacheObj.val[value] = $tag
                                    $div.append($tag)
                                    cacheObj.inputsLength++
                                } else {
                                    /**
                                     * 取消选中
                                     */
                                    $option && $option.removeClass(THIS)
                                    cacheObj.inputs[value] && cacheObj.inputs[value].remove()
                                    delete cacheObj.inputs[value]

                                    cacheObj.val[value].remove()
                                    delete cacheObj.val[value]
                                    cacheObj.inputsLength--
                                }

                                select.attr('_name', fieldName)

                                if (cacheObj.inputsLength) {
                                    $div.removeClass(HIDE)
                                    $input.addClass(HIDE)
                                    select.attr('name', '')
                                } else {
                                    $div.addClass(HIDE)
                                    $input.removeClass(HIDE)
                                    select.attr('name', fieldName)
                                }
                            }

                            function updateSelectOption(tag) {
                                let val = tag.attr('lay-value')
                                let $opt

                                /**
                                 * 弹层已经消失
                                 */
                                if (layerObj) {
                                    $opt = layerObj.find(`[lay-value="${val}"]`)
                                }

                                updateSelectValue($opt, 'remove', val)
                            }

                            //展开下拉
                            let showDown = function() {
                                    let offset = reElem.offset()
                                    let h = reElem.height()
                                    let scrollTop
                                    scrollTop = win.scrollTop()
                                    offset.top = offset.top + h - scrollTop + 'px'
                                    offset.left += 'px'

                                    layerIndex = layer.open({
                                        anim: -1,
                                        isOutAnim: false,
                                        closeBtn: false,
                                        title: false,
                                        content: cacheObj.renderListPanel(cacheObj.val || {}),
                                        shade: 0,
                                        time: 0,
                                        type: 1,
                                        area: reElem.width() + 'px',
                                        offset: [offset.top, offset.left],
                                        success(layero) {
                                            layerObj = layero
                                            dl = layero.find('.layui-select-options')
                                            dds = dl.children('dd')

                                            reElem.addClass(CLASS + 'ed')
                                            dds.removeClass(HIDE)

                                            let dlHeight = dl.outerHeight()

                                            reElem.addClass(CLASS + 'ed')
                                            dds.removeClass(HIDE)

                                            if (
                                                layero.offset().top + dlHeight + 5 - scrollTop >
                                                win.height()
                                            ) {
                                                layero.css({
                                                    top:
                                                        parseFloat(layero.css('top')) - dlHeight - h
                                                })
                                            }

                                            dl.css('visibility', 'visible')

                                            //选择
                                            dds.on('click', function() {
                                                let hasMulti = cacheObj.hasMulti
                                                let othis = $(this)
                                                let value = othis.attr('lay-value')
                                                let filter = select.attr('lay-filter') //获取过滤器
                                                let actionType

                                                if (othis.hasClass(DISABLED)) return false

                                                /**
                                                 * TODO：增加同名隐藏 input 来模拟提交
                                                 */
                                                if (hasMulti) {
                                                    if (value) {
                                                        /**
                                                         * 选中
                                                         */
                                                        if (!othis.hasClass(THIS)) {
                                                            actionType = 'add'
                                                        } else {
                                                            actionType = 'remove'
                                                        }
                                                        updateSelectValue(othis, actionType, value)
                                                    }
                                                } else {
                                                    if (othis.hasClass('layui-select-tips')) {
                                                        input.val('')
                                                        cacheObj.val = {}
                                                    } else {
                                                        input.val(othis.text())
                                                        othis.addClass(THIS)

                                                        cacheObj.val = {
                                                            [value]: 1
                                                        }
                                                    }

                                                    othis.siblings().removeClass(THIS)
                                                    select
                                                        .val(value)
                                                        .removeClass('layui-form-danger')
                                                }

                                                layui.event.call(
                                                    this,
                                                    MOD_NAME,
                                                    'select(' + filter + ')',
                                                    {
                                                        elem: select[0],
                                                        value: value,
                                                        othis: reElem
                                                    }
                                                )

                                                if (!hasMulti || !value) {
                                                    hideDown(true)
                                                }

                                                return false
                                            })
                                        }
                                    })
                                },
                                hideDown = function(choose) {
                                    layerObj = null
                                    reElem.removeClass(CLASS + 'ed ' + CLASS + 'up')
                                    input.blur()
                                    dds && dds.off('click')

                                    layer.close(layerIndex)

                                    if (choose) return

                                    notOption(input.val(), function(none) {
                                        if (none) {
                                            initValue = dl.find('.' + THIS).html()
                                            input.hasClass(HIDE) || input.val(initValue)
                                        }
                                    })
                                }

                            //点击标题区域
                            title.on('click', function(e) {
                                let $el = $(e.target)
                                if ($el.hasClass('layui-icon')) {
                                    let $tag = $el.parent()
                                    $tag.remove()
                                    e.stopPropagation()

                                    updateSelectOption($tag)
                                    return
                                }

                                if (reElem.hasClass(CLASS + 'ed')) {
                                    hideDown()
                                } else {
                                    hide(e, true)
                                    showDown()
                                }
                                dl.find('.' + NONE).remove()
                            })

                            //点击箭头获取焦点
                            title.find('.layui-edge').on('click', function() {
                                try {
                                    input.focus()
                                } catch (e) {
                                    //do nothing
                                }
                            })

                            //键盘事件
                            input.on('keydown', function(e) {
                                let keyCode = e.keyCode
                                //Tab键
                                if (keyCode === 9) {
                                    hideDown()
                                } else if (keyCode === 13) {
                                    //回车键
                                    e.preventDefault()
                                }
                            })

                            //检测值是否不属于select项
                            let notOption = function(value, callback, origin) {
                                let num = 0
                                layui.each(dds, function() {
                                    let othis = $(this),
                                        text = othis.text(),
                                        not = text.indexOf(value) === -1
                                    if (value === '' || origin === 'blur' ? value !== text : not)
                                        num++
                                    origin === 'keyup' &&
                                        othis[not ? 'addClass' : 'removeClass'](HIDE)
                                })
                                let none = num === dds.length
                                callback(none)
                                return none
                            }

                            //搜索匹配
                            let search = function(e) {
                                let value = this.value,
                                    keyCode = e.keyCode

                                if (
                                    keyCode === 9 ||
                                    keyCode === 13 ||
                                    keyCode === 37 ||
                                    keyCode === 38 ||
                                    keyCode === 39 ||
                                    keyCode === 40
                                ) {
                                    return false
                                }

                                notOption(
                                    value,
                                    function(none) {
                                        if (none) {
                                            dl.find('.' + NONE)[0] ||
                                                dl.append('<p class="' + NONE + '">无匹配项</p>')
                                        } else {
                                            dl.find('.' + NONE).remove()
                                        }
                                    },
                                    'keyup'
                                )

                                if (value === '') {
                                    dl.find('.' + NONE).remove()
                                }
                            }

                            if (isSearch) {
                                input.on('keyup', search).on('blur', function() {
                                    thatInput = input
                                    initValue = dl.find('.' + THIS).html()
                                    setTimeout(function() {
                                        notOption(
                                            input.val(),
                                            function() {
                                                initValue || input.val('') //none && !initValue
                                            },
                                            'blur'
                                        )
                                    }, 200)
                                })
                            }

                            reElem.find('dl>dt').on('click', function() {
                                return false
                            })

                            //关闭下拉
                            $(document)
                                .off('click', hide)
                                .on('click', hide)
                        }

                    if (elFilter) {
                        selects = selects.filter(`[lay-filter="${elFilter}"]`)
                    }

                    function isUndefined(v) {
                        return typeof v === 'undefined'
                    }

                    function hasValue(v) {
                        return !isUndefined(v) && v !== ''
                    }

                    selects.each(function(index, select) {
                        let othis = $(this),
                            hasRender = othis.next('.' + CLASS),
                            disabled = this.disabled,
                            dataValue = othis.data('value'),
                            value = isUndefined(dataValue) ? select.value : dataValue,
                            hasDefaultVal = hasValue(value),
                            selected, //获取当前选中项
                            optionsFirst = select.options[0]

                        othis.attr('_name', othis.attr('name') || othis.attr('_name'))

                        /**
                         * select.options 不是数组，获取不存在的属性会抛出异常
                         */
                        if (select.selectedIndex === -1) {
                            selected = $({})
                        } else {
                            selected = $(select.options[select.selectedIndex])
                        }

                        let id = uuid++
                        othis.data('uuid', id)

                        cache[id] = {}

                        if (typeof othis.attr('lay-ignore') === 'string') return othis.show()

                        let hasMulti

                        if (typeof othis.attr(MULTI) === 'string') {
                            hasMulti = true
                        }

                        if (hasDefaultVal) {
                            let vals = String(value).split(',')

                            if (vals.length === 1 && !hasMulti) {
                                selected = othis.find('option[value="' + value + '"]')

                                if (selected.length) {
                                    cache[id].val = {
                                        [value]: 1
                                    }
                                    othis.val(value)
                                } else {
                                    value = ''
                                }
                            } else {
                                let valObj = (cache[id].val = {})
                                for (let i = 0; i < vals.length; i++) {
                                    let v = vals[i]

                                    if (othis.find('option[value="' + v + '"]').length) {
                                        valObj[v] = 1
                                    }
                                }
                            }
                        }

                        let isSearch = typeof othis.attr('lay-search') === 'string',
                            placeholder = optionsFirst
                                ? optionsFirst.value ? TIPS : optionsFirst.innerHTML || TIPS
                                : TIPS

                        //替代元素
                        let reElem

                        if (hasMulti) {
                            reElem = $(
                                [
                                    '<div class="' +
                                        (isSearch ? '' : 'layui-unselect ') +
                                        CLASS +
                                        (hasMulti ? ' ' + CLASS_MULTI : '') +
                                        (disabled ? ' layui-select-disabled' : '') +
                                        '">',
                                    `<div class="${TITLE}"><div class="layui-hide layui-input"></div>` +
                                        '<input type="text" placeholder="' +
                                        placeholder +
                                        '" value="' +
                                        (hasValue(value) ? selected.html() || '' : '') +
                                        '" readonly' +
                                        ' class="layui-input layui-unselect' +
                                        (disabled ? ' ' + DISABLED : '') +
                                        '">',
                                    '<i class="layui-edge"></i></div>',
                                    '</div>'
                                ].join('')
                            )
                        } else {
                            reElem = $(
                                [
                                    '<div class="' +
                                        (isSearch ? '' : 'layui-unselect ') +
                                        CLASS +
                                        (hasMulti ? ' ' + CLASS_MULTI : '') +
                                        (disabled ? ' layui-select-disabled' : '') +
                                        '">',
                                    '<div class="' +
                                        TITLE +
                                        '"><input type="text" placeholder="' +
                                        placeholder +
                                        '" value="' +
                                        (hasValue(value) ? selected.html() || '' : '') +
                                        '" ' +
                                        (isSearch ? '' : 'readonly') +
                                        ' class="layui-input' +
                                        (isSearch ? '' : ' layui-unselect') +
                                        (disabled ? ' ' + DISABLED : '') +
                                        '">',
                                    '<i class="layui-edge"></i></div>',
                                    '</div>'
                                ].join('')
                            )
                        }

                        hasRender[0] && hasRender.remove() //如果已经渲染，则Rerender
                        othis.after(reElem)
                        events.call(this, reElem, disabled, isSearch)

                        cache[id].renderListPanel = renderListPanel
                        cache[id].hasMulti = hasMulti

                        if (hasMulti) {
                            cache[id].inputs = {}
                            cache[id].inputsLength = 0

                            if (!cache[id].val || !value) {
                                cache[id].inputs = {}
                                cache[id].inputsLength = 0
                                cache[id].val = {}
                            } else {
                                let addedNum = 0
                                let valArr = value.split(',')
                                let fieldName = othis.attr('name') || othis.attr('_name')

                                for (let i = 0; i < valArr.length; i++) {
                                    let item = valArr[i]
                                    let $oriOpt = othis.find(`option[value="${item}"]`)

                                    if (!$oriOpt.length) {
                                        continue
                                    }

                                    let $opt = $oriOpt.clone()
                                    $opt.children().remove()
                                    let val = $opt.html()

                                    let $input = $(
                                        `<input type="hidden" name="${fieldName}" value="${item}">`
                                    )

                                    cache[id].inputs[item] = $input
                                    reElem.append($input)

                                    let $tag = $(
                                        `<div class="layui-btn layui-btn-sm layui-btn-primary" lay-value="${item}">${val}<i class="layui-icon">&#x1006;</i></div>`
                                    )
                                    reElem.find('div.layui-input').append($tag)
                                    cache[id].val[item] = $tag
                                    addedNum++
                                }

                                if (addedNum) {
                                    cache[id].inputsLength = addedNum
                                    othis.attr('name', '')

                                    reElem.find('div.layui-input').removeClass(HIDE)
                                    reElem.find('input.layui-input').addClass(HIDE)
                                } else {
                                    cache[id].inputs = {}
                                    cache[id].inputsLength = 0
                                    cache[id].val = {}
                                }
                            }
                        }

                        function renderListPanel(valueMap) {
                            return [
                                '<dl class="layui-select-options layui-anim layui-anim-upbit' +
                                    (othis.find('optgroup')[0] ? ' layui-select-group' : '') +
                                    '">' +
                                    (function(options) {
                                        let arr = []
                                        layui.each(options, function(index, item) {
                                            if (index === 0 && !item.value) {
                                                arr.push(
                                                    `<dd lay-value="" class="layui-select-tips" title="${item.innerHTML ||
                                                        TIPS}">${item.innerHTML || TIPS}</dd>`
                                                )
                                            } else if (item.tagName.toLowerCase() === 'optgroup') {
                                                arr.push('<dt>' + item.label + '</dt>')
                                            } else {
                                                arr.push(
                                                    `<dd lay-value="${
                                                        item.value
                                                    }" class="${(hasOwnProperty(
                                                        valueMap,
                                                        item.value
                                                    )
                                                        ? THIS
                                                        : '') +
                                                        (item.disabled
                                                            ? ' ' + DISABLED
                                                            : '')}" title="${item.innerHTML}">` +
                                                        (hasMulti
                                                            ? '<i class="layui-icon">&#xe605;</i>'
                                                            : '') +
                                                        item.innerHTML +
                                                        '</dd>'
                                                )
                                            }
                                        })
                                        arr.length === 0 &&
                                            arr.push(
                                                '<dd lay-value="" class="' +
                                                    DISABLED +
                                                    '">没有选项</dd>'
                                            )
                                        return arr.join('')
                                    })(othis.find('*')) +
                                    '</dl>'
                            ].join('')
                        }
                    })
                },
                //复选框/开关
                checkbox: function() {
                    let CLASS = {
                        checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox'],
                        _switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
                    }
                    let checks = elemForm.find('input[type=checkbox]')

                    if (elFilter) {
                        checks = checks.filter(`[lay-filter="${elFilter}"]`)
                    }

                    let events = function(reElem, RE_CLASS) {
                        let check = $(this)

                        //勾选
                        reElem.on('click', function() {
                            let filter = check.attr('lay-filter'), //获取过滤器
                                text = (check.attr('lay-text') || '').split('|')

                            if (check[0].disabled) return

                            if (check[0].checked) {
                                check[0].checked = false

                                reElem
                                    .removeClass(RE_CLASS[1])
                                    .find('em')
                                    .text(text[1])
                                    .text(text[1])
                            } else {
                                check[0].checked = true

                                reElem
                                    .addClass(RE_CLASS[1])
                                    .find('em')
                                    .text(text[0])
                                    .text(text[0])
                            }

                            layui.event.call(check[0], MOD_NAME, RE_CLASS[2] + '(' + filter + ')', {
                                elem: check[0],
                                value: check[0].value,
                                othis: reElem
                            })
                        })
                    }

                    checks.each(function(index, check) {
                        let othis = $(this),
                            skin = othis.attr('lay-skin'),
                            text = (othis.attr('lay-text') || '').split('|'),
                            disabled = this.disabled
                        if (skin === 'switch') skin = '_' + skin
                        let RE_CLASS = CLASS[skin] || CLASS.checkbox

                        if (typeof othis.attr('lay-ignore') === 'string') return othis.show()

                        //替代元素
                        let hasRender = othis.next('.' + RE_CLASS[0])
                        let reElem = $(
                            [
                                '<div class="layui-unselect ' +
                                    RE_CLASS[0] +
                                    (check.checked ? ' ' + RE_CLASS[1] : '') +
                                    (disabled ? ' layui-checkbox-disbaled ' + DISABLED : '') +
                                    '" lay-skin="' +
                                    (skin || '') +
                                    '">',
                                {
                                    _switch:
                                        '<em>' +
                                        ((check.checked ? text[0] : text[1]) || '') +
                                        '</em><i></i>'
                                }[skin] ||
                                    (check.title.replace(/\s/g, '')
                                        ? '<span>' + check.title + '</span>'
                                        : '') +
                                        '<i class="layui-icon">' +
                                        (skin ? '&#xe605;' : '&#xe618;') +
                                        '</i>',
                                '</div>'
                            ].join('')
                        )

                        hasRender[0] && hasRender.remove() //如果已经渲染，则Rerender
                        othis.after(reElem)
                        events.call(this, reElem, RE_CLASS)
                    })
                },
                //单选框
                radio: function() {
                    let CLASS = 'layui-form-radio',
                        ICON = ['&#xe643;', '&#xe63f;'],
                        radios = elemForm.find('input[type=radio]'),
                        events = function(reElem) {
                            let radio = $(this),
                                ANIM = 'layui-anim-scaleSpring'

                            reElem.on('click', function() {
                                let name = radio[0].name,
                                    forms = radio.parents(ELEM)
                                let filter = radio.attr('lay-filter') //获取过滤器
                                let sameRadio = forms.find(
                                    'input[name=' + name.replace(/([.#[\]])/g, '\\$1') + ']'
                                ) //找到相同name的兄弟

                                if (radio[0].disabled) return

                                layui.each(sameRadio, function() {
                                    let next = $(this).next('.' + CLASS)
                                    this.checked = false
                                    next.removeClass(CLASS + 'ed')
                                    next
                                        .find('.layui-icon')
                                        .removeClass(ANIM)
                                        .html(ICON[1])
                                })

                                radio[0].checked = true
                                reElem.addClass(CLASS + 'ed')
                                reElem
                                    .find('.layui-icon')
                                    .addClass(ANIM)
                                    .html(ICON[0])

                                layui.event.call(radio[0], MOD_NAME, 'radio(' + filter + ')', {
                                    elem: radio[0],
                                    value: radio[0].value,
                                    othis: reElem
                                })
                            })
                        }

                    if (elFilter) {
                        radios = radios.filter(`[lay-filter="${elFilter}"]`)
                    }

                    radios.each(function(index, radio) {
                        let othis = $(this),
                            hasRender = othis.next('.' + CLASS),
                            disabled = this.disabled

                        if (typeof othis.attr('lay-ignore') === 'string') return othis.show()

                        //替代元素
                        let reElem = $(
                            [
                                '<div class="layui-unselect ' +
                                    CLASS +
                                    (radio.checked ? ' ' + CLASS + 'ed' : '') +
                                    (disabled ? ' layui-radio-disbaled ' + DISABLED : '') +
                                    '">',
                                '<i class="layui-anim layui-icon">' +
                                    ICON[radio.checked ? 0 : 1] +
                                    '</i>',
                                '<span>' +
                                    (function() {
                                        let title = radio.title || ''
                                        if (typeof othis.next().attr('lay-radio') === 'string') {
                                            title = othis.next().html()
                                            othis.next().remove()
                                        }
                                        return title
                                    })() +
                                    '</span>',
                                '</div>'
                            ].join('')
                        )
                        hasRender[0] && hasRender.remove() //如果已经渲染，则Rerender
                        othis.after(reElem)
                        events.call(this, reElem)
                    })
                }
            }

        elemForm = $(ELEM + (filter ? '[lay-filter="' + filter + '"]' : ''))

        if (type) {
            if (items[type]) {
                items[type]()
            } else {
                hint.error('不支持的' + type + '表单渲染')
            }
        } else {
            layui.each(items, function(index, item) {
                item()
            })
        }

        return that
    }

    //表单提交校验
    let submit = function() {
        /**
         * upload 中，this 就是触发 submit 事件的 form
         * @type {*|HTMLElement}
         */
        let button = $(this),
            verify = form.config.verify,
            stop = null,
            DANGER = 'layui-form-danger',
            field = {},
            elem = button.hasClass(ELEM.substring(1)) ? button : button.parents(ELEM).eq(0),
            verifyElem = elem.find('*[lay-verify]'), //获取需要校验的元素
            formElem = elem[0], //获取当前所在的form元素，如果存在的话
            fieldElem = elem.find('input,select,textarea'), //获取所有表单域
            filter = button.attr('lay-filter') //获取过滤器

        //开始校验
        layui.each(verifyElem, function(_, item) {
            let othis = $(this),
                vers = othis.attr('lay-verify').split('|'),
                verType = othis.attr('lay-verType'), //提示方式
                value = othis.val()

            let name
            name = item.name = (item.name || '').replace(/^\s*|\s*&/, '')

            if (!name || item.disabled) {
                return
            }

            if (value === null || value === undefined) {
                value = ''
            }

            othis.removeClass(DANGER)
            layui.each(vers, function(_, thisVer) {
                let isTrue, //是否命中校验
                    errorText = '', //错误提示文本
                    isFn = typeof verify[thisVer] === 'function'

                //匹配验证规则
                if (verify[thisVer]) {
                    isTrue = isFn
                        ? (errorText = verify[thisVer](value, item))
                        : !verify[thisVer][0].test(value)
                    errorText = errorText || verify[thisVer][1]

                    //如果是必填项或者非空命中校验，则阻止提交，弹出提示
                    if (isTrue) {
                        //提示层风格
                        if (verType === 'tips') {
                            let follow = othis

                            if (typeof othis.attr('lay-ignore') !== 'string') {
                                if (
                                    item.tagName.toLowerCase() === 'select' ||
                                    /^checkbox|radio$/.test(item.type)
                                ) {
                                    follow = othis.next()
                                }
                            }

                            layer.tips(errorText, follow, { tips: 1 })
                        } else if (verType === 'alert') {
                            layer.alert(errorText, { title: '提示', shadeClose: true })
                        } else {
                            layer.msg(errorText, { icon: 5, shift: 6 })
                        }
                        if (!device.android && !device.ios) {
                            try {
                                item.focus()
                            } catch (e) {
                                //do nothing
                            }
                        } //非移动设备自动定位焦点
                        othis.addClass(DANGER)
                        return (stop = true)
                    }
                }
            })
            if (stop) return stop
        })

        if (stop) return false

        let nameIndex = 0 //数组 name 索引
        layui.each(fieldElem, function(_, item) {
            let name
            name = item.name = (item.name || '').replace(/^\s*|\s*&/, '')

            if (!name || item.disabled) {
                return
            }

            //用于支持数组 name
            if (/^.*\[]$/.test(name)) {
                let key = name.match(/^(.*)\[]$/g)[0]
                nameIndex[key] = nameIndex[key] | 0
                name = item.name = name.replace(/^(.*)\[]$/, '$1[' + nameIndex[key]++ + ']')
            }

            if (/^checkbox|radio$/.test(item.type) && !item.checked) {
                return
            }

            if (isArray(field[name])) {
                field[name].push(item.value)
            } else {
                if (typeof field[name] !== 'undefined') {
                    field[name] = [field[name], item.value]
                } else {
                    field[name] = item.value
                }
            }
        })

        //获取字段
        return layui.event.call(this, MOD_NAME, 'submit(' + filter + ')', {
            elem: this,
            form: formElem,
            field: field
        })
    }

    let toString = Object.prototype.toString
    let hasOwn = Object.prototype.hasOwnProperty

    function isArray(arr) {
        return toString.call(arr) === '[object Array]'
    }

    function hasOwnProperty(obj, val) {
        return hasOwn.call(obj, val)
    }

    //自动完成渲染
    let form = new Form(),
        dom = $(document),
        win = $(window)

    form.render()

    //表单reset重置渲染
    dom.on('reset', ELEM, function() {
        let filter = $(this).attr('lay-filter')
        setTimeout(function() {
            form.render(null, filter)
        }, 50)
    })

    //表单提交事件
    dom.on('submit', ELEM, submit).on('click', '*[lay-submit]', submit)

    exports(MOD_NAME, form)
})
