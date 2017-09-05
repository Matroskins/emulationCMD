$(document).on('ready', function() {
    ko.applyBindings(knockoutVM)

    var firstLetter = '',
        NameIndex = 0,
        cursorElem = $('#cursor')

    $(document).on('keydown', function(e) {
        var keyArray = [16, 17, 18, 37, 39, 45, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
        if (_.find(keyArray, function(num) { return e.keyCode == num; })) {
            return
        }
        if (!(e.keyCode === 9)) {
            firstLetter = '';
            NameIndex = 0;
        }
        switch (e.keyCode) {
            case 13:
                knockoutVM.callCommand()

                let consoleTextEl = document.getElementById('text')
                let scrollHeightNum = consoleTextEl.scrollHeight
                let consoleEl = document.getElementById('console_id')
                consoleEl.scrollTop += scrollHeightNum
                break
            case 8:
                e.preventDefault()
                knockoutVM.inputCommand(knockoutVM.inputCommand().substring(0, knockoutVM.inputCommand().length - 1))
                break
            case 9:
                e.preventDefault()
                firstLetter = (firstLetter === '') ? knockoutVM.inputCommand() : firstLetter
                let filteredCommandNameArray = _.filter(knockoutVM.commandNames, function(name) { return name.slice(0, firstLetter.length) === firstLetter })

                if ((firstLetter) && !(filteredCommandNameArray.length === 0)) {
                    knockoutVM.inputCommand(filteredCommandNameArray[NameIndex])
                    NameIndex = ((filteredCommandNameArray.length - 1) === NameIndex) ? 0 : (NameIndex + 1)
                }
                break
            case 38:
                var index = knockoutVM.commandHistoryIndex()
                index > 0 ? index-- : 0
                knockoutVM.commandHistoryIndex(index)
                knockoutVM.getCommandFromHistory()
                break
            case 40:
                var index = knockoutVM.commandHistoryIndex()
                index < knockoutVM.commandHistory().length - 1 ? index++ : knockoutVM.commandHistory().length - 1
                knockoutVM.commandHistoryIndex(index)
                knockoutVM.getCommandFromHistory()
                break
            default:
                knockoutVM.inputCommand(knockoutVM.inputCommand() + e.key)
                break
        }
    })


    setInterval(function() {
        cursorElem.toggle()
    }, 500)

})

var knockoutVM = function() {
    var self = this
    self.commandHistory = ko.observableArray([])
    self.commandHistoryIndex = ko.observable(0)
    self.directoryText = ko.observable('')
    self.inputCommand = ko.observable('')
    self.scrolHeight = ko.observable()
    self.sectionList = ko.observableArray([{
            name: 'about',
            fullPath: '',
            url: 'about.html',
            description: 'О компании',
            type: 'Section'
        },
        {
            name: 'vacancy',
            fullPath: '',
            url: 'vacancy.html',
            description: 'Наши вакансии',
            type: 'Section'
        },
        {
            name: '.net',
            fullPath: 'vacancy',
            url: 'MiddleNet.html',
            description: 'Описание вакансии MiddleNet',
            type: 'Section'
        },
        {
            name: 'qc',
            fullPath: 'vacancy',
            url: 'JuniorQC.html',
            description: 'Описание вакансии Junior QC',
            type: 'Section'
        },
        {
            name: 'projects',
            fullPath: '',
            url: 'projects.html',
            description: 'Наши продукты',
            type: 'Section'
        },
        {
            name: 'clients',
            fullPath: '',
            url: 'clients.html',
            description: 'Наши клиенты',
            type: 'Section'
        },
        {
            name: 'contacts',
            fullPath: '',
            url: 'contacts.html',
            description: 'Наши контакты',
            type: 'Section'
        },
        {
            name: 'education',
            fullPath: '',
            url: 'education.html',
            description: 'Наши образовательные программы',
            type: 'Section'
        },
        {
            name: 'education',
            fullPath: 'education',
            url: 'educationNet.html',
            description: 'Образовательная программа для .Net',
            type: 'Section'
        },
        {
            name: 'education',
            fullPath: 'education',
            url: 'educationMqc.html',
            description: 'Программа курсов Mqc',
            type: 'Section'
        },
        {
            name: 'education',
            fullPath: 'education',
            url: 'educationAtqc.html',
            description: 'Программа курсов atqc',
            type: 'Section'
        }
    ])

    self.commandList = ko.observableArray([{
            name: 'rm -rf',
            url: 'http://RussiaLaw.html',
            description: 'Закон РФ о мошенничестве',
            type: 'Command',
            visibility: 'private'
        },
        {
            name: 'clear',
            description: 'Очистить экран',
            type: 'Command',
            visibility: 'public'
        },
        {
            name: 'dir',
            description: 'Разделы сайта',
            type: 'Command',
            visibility: 'public'
        },
        {
            name: 'TAB',
            description: 'Автодополнение',
            type: 'Command',
            visibility: 'private'
        },
        {
            name: 'pwd',
            description: 'Показать текущий раздел ',
            type: 'Command',
            visibility: 'public'
        },
        {
            name: 'cd',
            description: 'Переход между разделами сайта',
            type: 'Command',
            visibility: 'public'
        }
    ])

    self.callCommand = function() {
        self.commandHistory.push(self.inputCommand())
        self.commandHistoryIndex(self.commandHistory().length)

        var comandLine = $('<div></div>').text('SOLARLAB\\' + self.directoryText() + '>' + self.inputCommand()),
            emptyLine = $('<div></div>').addClass('clear-line'),
            div = '',
            command = self.inputCommand().toLowerCase().split(' '),
            html = '',
            errorCommand = '"' + self.inputCommand() + '" Не является внутренней или внешней командой, исполняемой программой или пакетным файлом.'
        switch (command[0]) {

            case 'dir':
                if (command.length > 1) {
                    html = errorCommand
                    break
                }
                html = '<br/>&nbsp;Содержимое сайта SOLARLAB<br/><br/>'
                html += self.prepareList(currentDirectory())
                break

            case '--help':
                html = '<br/>&nbsp;Список команд<br/><br/>'
                html += self.prepareList(self.commandList())
                break

            case 'pwd':
                if (command.length > 1) {
                    html = errorCommand + self.directoryText()
                    break
                }
                html = 'SOLARLAB\\' + self.directoryText()
                break

            case 'cd':
                if (command.length > 2) {
                    html = errorCommand
                    break
                }
                if (command.length === 1) {
                    self.directoryText('')
                    break
                }
                let currentDirectoryText = self.directoryText();

                if (command[1] === '..') {
                    let currentDirectoryArray = currentDirectoryText.split('\\');
                    currentDirectoryArray.pop();

                    let pathWithoutDirectory = currentDirectoryArray.reduce(function(sum, current, index) {
                        if ((currentDirectoryArray.length - 1) === index) {
                            return sum + current;
                        }
                        return sum + current + '\\';
                    }, '');
                    self.directoryText(pathWithoutDirectory);
                    break
                }

                let currentDir = currentDirectory(),
                    page = _.find(currentDir, function(elem) {
                        return elem.name === command[1]
                    })
                if (_.isUndefined(page)) {
                    html = errorCommand
                    break
                }
                self.directoryText(currentDirectoryText + '\\' + page.name)
                $.ajax({
                    url: page.url,
                    async: false,
                    success: function(text) {
                        html = text
                    },
                    error: function() {
                        html = errorCommand
                    }
                })
                break

            case 'rm':
                if (command[1] === '-rf') {
                    let page = {
                        name: 'RussiaLaw',
                        url: 'RussiaLaw.html',
                        description: 'Юридическая справка',
                        type: 'Section'
                    }
                    $.ajax({
                        url: page.url,
                        async: false,
                        success: function(text) {
                            html = text
                        },
                        error: function() {
                            html = errorCommand
                        }
                    })
                } else {
                    html = errorCommand
                }
                break

            case 'clear':
                var clearMark = true;
                break;
            default:
                html = errorCommand
                break
        }
        div = $('<div></div>').html(html)
        self.inputCommand('')

        $('#text').append(comandLine).append(div).append(emptyLine)
        if (clearMark) {
            $('#text').empty();
        }
        clearMark = false;

    }

    self.getCommandFromHistory = function() {
        self.inputCommand(self.commandHistory()[self.commandHistoryIndex()])
    }

    self.prepareList = function(array) {
        let typeOfArrayElement = _.first(array).type,
            outputArray = (typeOfArrayElement === 'Section') ? array :
            (typeOfArrayElement === 'Command') ? sortedCommand(array) : []

        function sortedCommand(array) {
            let filteredArray = _.filter(array, function(element) {
                    return element.visibility === 'public'
                }),
                sortedArray = _.sortBy(filteredArray, 'name')
            return sortedArray
        }

        function outputTable(outputArray, typeOfArrayElement) {

            let resHtml = $('<table></table>')

            _.each(outputArray, function(elem, index) {
                var tr = $('<tr></tr>')
                tr.append($('<td></td>').html(elem.name))
                tr.append($('<td></td>').html('&nbsp;&nbsp;' + elem.description))
                resHtml.append(tr)
            })

            if (typeOfArrayElement === 'Section') {
                var tr = $('<tr></tr>')
                tr.append($('<td></td>'))
                tr.append($('<td></td>').html('&nbsp;&nbsp;' + outputArray.length + ' раздела(ов)'))
            }
            resHtml.append(tr)

            return resHtml[0].outerHTML
        }
        return outputTable(outputArray, typeOfArrayElement)
    }

    function currentDirectory() {
        let sectionArray = self.sectionList(),
            directoryText = self.directoryText(),
            onlySectionInside = sectionArray.filter(function(sectionElement) {
                return sectionElement.fullPath === directoryText
            });
        return onlySectionInside;
    }
    return function() {
        return {
            directoryText: self.directoryText,
            commandNames: _.map(self.commandList(), function(element) { return element["name"] }),
            inputCommand: self.inputCommand,
            commandHistory: self.commandHistory,
            commandHistoryIndex: self.commandHistoryIndex,
            callCommand: self.callCommand,
            getCommandFromHistory: self.getCommandFromHistory
        }
    }()
}()