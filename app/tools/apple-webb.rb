# Det som App Store Connect inte har officiellt API för, via Apple ID-sessionen (fastlane/spaceship, samma väg som
# fastlane produce och upload_app_privacy_details_to_app_store). Sessionen skapas av Carl med apple-inloggning.ps1.
# Skickar ALDRIG ett lösenord: är sessionen ute skriver skriptet SESSION_UTGANGEN och slutar (inga misslyckade
# inloggningar som kan låsa kontot).
#   ruby apple-webb.rb koll
#   ruby apple-webb.rb ny-app <bundle> "<namn>" <sku> [en-US]       skapar appen (New App) om den saknas
#   ruby apple-webb.rb privacy <bundle>                              App Privacy: "No, we do not collect data" + publicera
#   (köpen på första versionen: officiellt API, app/tools/asc-app.mjs skicka)
require 'spaceship'

IDFIL = File.join(Dir.home, '.secrets', 'apple-id.txt')
abort('SESSION_UTGANGEN – ingen inloggning än: kör app/tools/apple-inloggning.ps1') unless File.exist?(IDFIL)
USER = File.read(IDFIL).strip
ENV['FASTLANE_PASSWORD'] = 'anvands-inte-sessionen-kontrolleras-forst'   # login() kräver ett värde; skickas bara om sessionen är giltig ≠ fall
PIXELCITY_BUNDLE = 'io.eightbitcat.pixelcity'   # för att välja rätt team (8bitcat)

def session_ok?
  c = Spaceship::TunesClient.new
  c.user = USER
  c.send(:load_session_from_file) && (c.send(:fetch_olympus_session) rescue false) ? true : false
rescue StandardError
  false
end

def logga_in
  abort('SESSION_UTGANGEN – kör app/tools/apple-inloggning.ps1 (lösenord + kod), sedan igen') unless session_ok?
  Spaceship::Tunes.login(USER, ENV['FASTLANE_PASSWORD'])
  teams = Spaceship::Tunes.client.teams
  vald = nil
  teams.each do |t|
    id = t['providerId'] || t.dig('contentProvider', 'contentProviderId')
    Spaceship::Tunes.client.team_id = id
    Spaceship::ConnectAPI.login(USER, ENV['FASTLANE_PASSWORD'], use_portal: false, use_tunes: true, tunes_team_id: id, skip_select_team: true)
    if Spaceship::ConnectAPI::App.find(PIXELCITY_BUNDLE)
      vald = [id, t['name'] || t.dig('contentProvider', 'name')]
      break
    end
  end
  abort('hittar inget team med Pixelcity') unless vald
  vald
end

cmd = ARGV[0] || 'koll'
case cmd
when 'koll'
  ok = session_ok?
  puts ok ? "SESSION_OK (#{USER})" : 'SESSION_UTGANGEN'
  if ok
    id, namn = logga_in
    puts "team: #{namn} (#{id})"
  end
when 'ny-app'
  bundle, namn, sku, sprak = ARGV[1], ARGV[2], ARGV[3], (ARGV[4] || 'en-US')
  logga_in
  if (app = Spaceship::ConnectAPI::App.find(bundle))
    puts "FINNS #{app.id} #{app.name}"
  else
    Spaceship::ConnectAPI::App.create(name: namn, version_string: '1.0', sku: sku, primary_locale: sprak, bundle_id: bundle, platforms: ['IOS'])
    app = nil
    10.times { break if (app = Spaceship::ConnectAPI::App.find(bundle)); sleep 3 }
    abort('appen skapades men syns inte än – kör koll om en stund') unless app
    puts "SKAPAD #{app.id} #{app.name}"
  end
when 'privacy'
  bundle = ARGV[1]
  logga_in
  app = Spaceship::ConnectAPI::App.find(bundle) or abort("ingen app #{bundle}")
  usages = Spaceship::ConnectAPI::AppDataUsage.all(app_id: app.id, includes: 'category,grouping,purpose,dataProtection', limit: 500)
  if usages.any? { |u| u.data_protection&.id == 'DATA_NOT_COLLECTED' }
    puts 'App Privacy: redan "inga data samlas in"'
  else
    usages.each(&:delete!)
    Spaceship::ConnectAPI::AppDataUsage.create(app_id: app.id, app_data_usage_category_id: nil, app_data_usage_protection_id: 'DATA_NOT_COLLECTED', app_data_usage_purpose_id: nil)
    puts 'App Privacy: "No, we do not collect data" satt'
  end
  state = Spaceship::ConnectAPI::AppDataUsagesPublishState.get(app_id: app.id)
  if state.published
    puts 'App Privacy: publicerad'
  else
    state.publish!
    puts 'App Privacy: publicerad nu'
  end
when 'kop-med-version'
  # Första köpen av en typ måste följa med en appversion (FIRST_CONSUMABLE_MUST_BE_SUBMITTED_ON_VERSION), och det
  # officiella API:t kan inte det. Webbsidan (iris, samma session) markerar köpet "submitWithNextAppStoreVersion".
  bundle = ARGV[1]
  logga_in
  app = Spaceship::ConnectAPI::App.find(bundle) or abort("ingen app #{bundle}")
  iris = Spaceship::ConnectAPI.client.tunes_request_client
  # köpens id (och produkt-id) kommer från det officiella API:t: ruby apple-webb.rb kop-med-version <bundle> <id:produkt> …
  lista = ARGV[2..].map { |x| id, pid = x.split(':', 2); { 'id' => id, 'attributes' => { 'productId' => pid } } }
  abort('inga köp angivna') if lista.empty?
  lista.each do |i|
    a = i['attributes']
    begin
      sub = ENV['INSKICK']   # ett utkast (reviewSubmission) där versionen redan ligger: köpet läggs i samma inskick
      r = if sub
            iris.post('v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: sub } }, inAppPurchaseV2: { data: { type: 'inAppPurchases', id: i['id'] } } } } })
          else
            iris.post('v1/inAppPurchaseSubmissions', { data: { type: 'inAppPurchaseSubmissions', attributes: { submitWithNextAppStoreVersion: true }, relationships: { inAppPurchaseV2: { data: { type: 'inAppPurchases', id: i['id'] } } } } })
          end
      fel = r.body.is_a?(Hash) ? r.body['errors'] : nil
      if fel && !fel.empty?
        puts "  ✗ #{a['productId']}: #{fel.map { |e| "#{e['code']} #{e['detail']}" }.join(' | ')[0, 400]}"
      else
        puts "  ✓ #{a['productId']}: följer med nästa version"
      end
    rescue StandardError => e
      puts "  ✗ #{a['productId']}: #{e.message[0, 400]}"
    end
  end
else
  abort("okänt kommando #{cmd}")
end
