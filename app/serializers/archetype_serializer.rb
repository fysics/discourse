class ArchetypeSerializer < ApplicationSerializer

  attributes :id, :name, :capabilities, :slug, :options

  def options
    opts = []
    object.options.each_pair do |key, value|
      unless [:capabilities, :archetype].include? key
        opts << {
            key: key,
            title: I18n.t("archetypes.#{object.id}.options.#{key}.title"),
            description: I18n.t("archetypes.#{object.id}.options.#{key}.description"),
            option_type: value
          }
      end
    end
    opts
  end

  def name
    I18n.t("archetypes.#{object.id}.title")
  end

  def capabilities
    return object.options[:capabilities]
  end

  def slug
    begin
      SiteSetting.send("archetypes_#{object.id}.slug") || object.id
    rescue NoMethodError
      object.id
    end
  end

end
