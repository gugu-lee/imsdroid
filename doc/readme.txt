doubangou 编译问题

./autogen.sh
cd binding
./autogen.sh
cd ..
./android_build.sh

注意，bindings\_common\sipstack.i
会有报错，取消 以#注释的那几行。
这一操作时，不要用vscode这样的工具保存，会自动在$后加空格，导致更多的错误.

生成tinyWRAP时，会有编译报错，-fexceptions 在合适的文件加此编译标识.
 configure configure.ac binding/makefile，合适的位置。
此问题未准确调试。最终引起的问题的是 binding/makefile 。