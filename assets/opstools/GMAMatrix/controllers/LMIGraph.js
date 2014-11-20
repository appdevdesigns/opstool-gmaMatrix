
steal(
        // List your Controller's dependencies here:
        'appdev',
//        'opstools/GMAMatrix/models/Projects.js',
//        'appdev/widgets/ad_delete_ios/ad_delete_ios.js',
//        'opstools/GMAMatrix/views/LMIDefinition/LMIDefinition.ejs',
function(){

    // Namespacing conventions:
    // AD.controllers.[application].[controller]
    if (typeof AD.controllers.opstools == 'undefined') AD.controllers.opstools = {};
    if (typeof AD.controllers.opstools.GMAMatrix == 'undefined') AD.controllers.opstools.GMAMatrix = {};
    AD.controllers.opstools.GMAMatrix.LMIGraph = AD.classes.UIController.extend({
        
        // callback function used for graph tooltips
        tooltipCB: function() {
            return this.period + ': ' + this.score;
        },
        
        // graph color?
        seriesStyles: [
            {
                fill: "#999999",
                stroke: "#333333"
            }
        ],
        
        // Recursively compute the greatest common denominator of a & b
        // @param integer a
        // @param integer b
        // @return integer
        gcd: function(a, b) {
            if (!b) {
                return a;
            }
            return gcd(b, a % b);
        },
        
        // @param integer a
        // @param integer b
        // @return string
        ratioInteger: function(a, b) {
            var gcd = this.gcd(a, b);
            return '' + (a/gcd) + ':' + (b/gcd);
        },
        
        // @param integer a
        // @param integer b
        // @return string
        ratioFloat: function(a, b) {
            if (a * b == 0) {
                return '';
            }
            else if (b > a) {
                return '1:' + (Math.round(b/a * 100) / 100);
            } else {
                return '' + (Math.round(a/b * 100) / 100) + ':1';
            }
        }
    
    }, {

        init: function (element, options) {
            var self = this;
            options =  AD.defaults({
                templateDOM: '//opstools/GMAMatrix/views/LMIGraph/LMIGraph.ejs',
                titleLMI: '', // e.g. 'Exposing through mass means'
                key: '' // e.g. 'etmm'
            }, options);
            this.options = options;

            // Call parent init
            AD.classes.UIController.apply(this, arguments);


            this.initDOM();
        },

        
        initDOM: function () {
            var html = can.view(this.options.templateDOM, { title: this.options.titleLMI } );
            this.element.html(html);
            this.element.find('[translate]').each(function(){
                $(this).removeAttr('translate');
                AD.controllers.Label.keylessCreate($(this));
            });
        },
        

        // @param object data
        // {
        //      staff: [ val1, val2, val3, ... ],
        //      disciple: [ val1, val2, val3, ... ],
        //      periods: [ date1, date2, date2, ... ]
        // }
        render: function (data) {
            var $staffGraph = this.element.find('.staff .gmaSparkline');
            var $staffTotal = this.element.find('.staff .field-total');
            var $discipleGraph = this.element.find('.disciple .gmaSparkline');
            var $discipleTotal = this.element.find('.disciple .field-total');
            var $ratio = this.element.find('.total .field-ratio');
            var $combinedTotal = this.element.find('.total .field-total');
            
            var staffData = [];
            var discipleData = [];
            var staffTotal = 0;
            var discipleTotal = 0;
            
            var parseValue = function(index, dataArray) {
                if (Array.isArray(dataArray)) {
                    return parseInt( dataArray[index] ) || 0;
                } else {
                    return 0;
                }
            };
            
            for (var i=0; i<data.periods.length; i++) {
                var staffValue = parseValue(i, data.staff);
                staffTotal += staffValue;
                staffData.push({ 
                    period: data.periods[i],
                    score: staffValue
                });
                var discipleValue = parseValue(i, data.disciple);
                discipleTotal += discipleValue;
                discipleData.push({
                    period: data.periods[i],
                    score: discipleValue
                });
            }
            
            $staffGraph.wijsparkline({
                data: staffData,
                bind: 'score',
                tooltipContent: this.constructor.tooltipCB,
                type: 'area',
                seriesStyles: this.constructor.seriesStyles
            });
            $staffTotal.text(staffTotal);

            $discipleGraph.wijsparkline({
                data: discipleData,
                bind: 'score',
                tooltipContent: this.constructor.tooltipCB,
                type: 'area',
                seriesStyles: this.constructor.seriesStyles
            });
            $discipleTotal.text(discipleTotal);
            
            $ratio.text(this.constructor.ratioFloat(staffTotal, discipleTotal));
            $combinedTotal.text(staffTotal + discipleTotal);
        
        }



    });


});