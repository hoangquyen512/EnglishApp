UPDATE vocabulary SET
  word = CASE id
    WHEN 1 THEN 'invoice'
    WHEN 2 THEN 'applicant'
    WHEN 3 THEN 'deadline'
    WHEN 4 THEN 'conference'
    WHEN 5 THEN 'shipment'
    WHEN 6 THEN 'budget'
    WHEN 7 THEN 'employee'
    WHEN 8 THEN 'reservation'
    WHEN 9 THEN 'inventory'
    WHEN 10 THEN 'memo'
  END,
  meaning = CASE id
    WHEN 1 THEN 'hóa đơn'
    WHEN 2 THEN 'ứng viên'
    WHEN 3 THEN 'hạn chót'
    WHEN 4 THEN 'hội nghị'
    WHEN 5 THEN 'lô hàng'
    WHEN 6 THEN 'ngân sách'
    WHEN 7 THEN 'nhân viên'
    WHEN 8 THEN 'đặt chỗ'
    WHEN 9 THEN 'hàng tồn kho'
    WHEN 10 THEN 'bản ghi nhớ'
  END,
  example = CASE id
    WHEN 1 THEN 'Please attach the invoice to your email.'
    WHEN 2 THEN 'Each applicant must submit a résumé by Friday.'
    WHEN 3 THEN 'The deadline for the report is next Monday.'
    WHEN 4 THEN 'She will speak at an international conference in May.'
    WHEN 5 THEN 'The shipment will arrive at the warehouse tomorrow.'
    WHEN 6 THEN 'We need to reduce the marketing budget this quarter.'
    WHEN 7 THEN 'Every employee receives a complimentary lunch on Fridays.'
    WHEN 8 THEN 'I made a reservation at the hotel near headquarters.'
    WHEN 9 THEN 'Please update the inventory before the store opens.'
    WHEN 10 THEN 'The manager sent a memo about the new dress code.'
  END,
  example_vi = CASE id
    WHEN 1 THEN 'Vui lòng đính kèm hóa đơn vào email của bạn.'
    WHEN 2 THEN 'Mỗi ứng viên phải nộp sơ yếu lý lịch trước thứ Sáu.'
    WHEN 3 THEN 'Hạn chót nộp báo cáo là thứ Hai tuần sau.'
    WHEN 4 THEN 'Cô ấy sẽ phát biểu tại một hội nghị quốc tế vào tháng Năm.'
    WHEN 5 THEN 'Lô hàng sẽ đến kho vào ngày mai.'
    WHEN 6 THEN 'Chúng ta cần cắt giảm ngân sách marketing quý này.'
    WHEN 7 THEN 'Mỗi nhân viên được ăn trưa miễn phí vào thứ Sáu.'
    WHEN 8 THEN 'Tôi đã đặt phòng tại khách sạn gần trụ sở.'
    WHEN 9 THEN 'Vui lòng cập nhật hàng tồn kho trước khi cửa hàng mở cửa.'
    WHEN 10 THEN 'Quản lý đã gửi bản ghi nhớ về quy định trang phục mới.'
  END,
  phonetic = CASE id
    WHEN 1 THEN '/ˈɪn.vɔɪs/'
    WHEN 2 THEN '/ˈæp.lɪ.kənt/'
    WHEN 3 THEN '/ˈded.laɪn/'
    WHEN 4 THEN '/ˈkɑːn.fər.əns/'
    WHEN 5 THEN '/ˈʃɪp.mənt/'
    WHEN 6 THEN '/ˈbʌdʒ.ɪt/'
    WHEN 7 THEN '/ɪmˈplɔɪ.iː/'
    WHEN 8 THEN '/ˌrez.ərˈveɪ.ʃn/'
    WHEN 9 THEN '/ˈɪn.vən.tɔː.ri/'
    WHEN 10 THEN '/ˈmem.oʊ/'
  END,
  part_of_speech = 'n.',
  image_key = CASE id
    WHEN 1 THEN 'invoice'
    WHEN 2 THEN 'applicant'
    WHEN 3 THEN 'deadline'
    WHEN 4 THEN 'conference'
    WHEN 5 THEN 'shipment'
    WHEN 6 THEN 'budget'
    WHEN 7 THEN 'employee'
    WHEN 8 THEN 'reservation'
    WHEN 9 THEN 'inventory'
    WHEN 10 THEN 'memo'
  END,
  category = 'TOEIC'
WHERE id BETWEEN 1 AND 10;
