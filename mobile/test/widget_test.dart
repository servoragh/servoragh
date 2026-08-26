import 'package:flutter_test/flutter_test.dart';
import 'package:servora_mobile/main.dart';

void main() {
  testWidgets('Servora app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ServoraMobileApp());
    expect(find.byType(ServoraMobileApp), findsOneWidget);
  });
}
